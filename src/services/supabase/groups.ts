/**
 * Supabase data service — Groups.
 */

import { supabase } from './supabase';
import { toGroup, toUser } from './mappers';
import type { Group, User } from '@/shared/types';

/** Fetch all groups the current user belongs to. */
export async function listMyGroups(): Promise<Group[]> {
  const { data: memberships, error: memberErr } = await supabase
    .from('group_members')
    .select('group_id');

  if (memberErr) throw memberErr;
  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);

  const { data: groupRows, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (groupErr) throw groupErr;

  const { data: allMembers, error: memErr } = await supabase
    .from('group_members')
    .select('group_id, user_id')
    .in('group_id', groupIds);

  if (memErr) throw memErr;

  const membersByGroup = new Map<string, string[]>();
  for (const row of allMembers ?? []) {
    const arr = membersByGroup.get(row.group_id) ?? [];
    arr.push(row.user_id);
    membersByGroup.set(row.group_id, arr);
  }

  return (groupRows ?? []).map((row) =>
    toGroup(row, membersByGroup.get(row.id) ?? [])
  );
}

/** Fetch a single group by ID. */
export async function getGroup(groupId: string): Promise<Group> {
  const { data: row, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) throw error;

  const { data: members, error: memErr } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  if (memErr) throw memErr;

  return toGroup(row, (members ?? []).map((m) => m.user_id));
}

/** Create a new group and auto-add the creator as a member. */
export async function createGroup(params: {
  name: string;
  description?: string;
}): Promise<Group> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: row, error } = await supabase
    .from('groups')
    .insert({
      name: params.name,
      description: params.description ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: memErr } = await supabase.from('group_members').insert({
    group_id: row.id,
    user_id: user.id,
  });

  if (memErr) throw memErr;

  return toGroup(row, [user.id]);
}

/** Add a user to a group. */
export async function addGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: userId,
  });
  if (error) throw error;
}

/** Fetch profile data for a list of user IDs. */
export async function getGroupMemberProfiles(
  memberIds: string[]
): Promise<User[]> {
  if (memberIds.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', memberIds);
  if (error) throw error;
  return (data ?? []).map(toUser);
}
