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

/**
 * Create a new group atomically via the `create_group` RPC.
 *
 * Direct `insert into groups` fails RLS after `.select()` because the SELECT
 * policy requires membership, which can't exist until after the insert.
 * The RPC runs as SECURITY DEFINER and inserts the group + creator + any
 * pre-selected friend members in one transaction.
 */
export async function createGroup(params: {
  name: string;
  description?: string;
  coverImage?: string;
  memberIds?: string[];
}): Promise<Group> {
  const { data, error } = await supabase.rpc('create_group', {
    p_name: params.name,
    p_description: params.description ?? null,
    p_cover_image: params.coverImage ?? null,
    p_member_ids: params.memberIds ?? [],
  });

  if (error) throw error;

  const row = data as Parameters<typeof toGroup>[0];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const memberIds = [
    ...(user?.id ? [user.id] : []),
    ...(params.memberIds ?? []).filter((id) => id !== user?.id),
  ];

  return toGroup(row, memberIds);
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
