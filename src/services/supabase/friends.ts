/**
 * Supabase data service — Friends & friend requests.
 *
 * Direct writes to `friendships` / `friend_requests` are blocked by RLS; all
 * mutations go through SECURITY DEFINER RPCs defined in 0002_friends_flow.sql.
 */

import { supabase } from './supabase';
import { toFriendRequest, toUser } from './mappers';
import type { FriendRequest, FriendRequestWithProfile, User } from '@/shared/types';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the profiles of all friends for the current user. */
export async function listFriends(): Promise<User[]> {
  const { data: rows, error } = await supabase
    .from('friendships')
    .select('friend_id');

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const friendIds = rows.map((r) => r.friend_id);

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds);

  if (profErr) throw profErr;
  return (profiles ?? []).map(toUser);
}

/** Search users by email substring (ILIKE). Excludes self + existing friends. */
export async function searchUsersByEmail(query: string, currentUserId: string): Promise<User[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', `%${trimmed}%`)
    .neq('id', currentUserId)
    .limit(20);

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('owner_id', currentUserId);

  const friendIds = new Set((friendships ?? []).map((r) => r.friend_id));

  return profiles.filter((p) => !friendIds.has(p.id)).map(toUser);
}

/** Fetch pending incoming requests (other users asking to be friends with me). */
export async function listIncomingRequests(): Promise<FriendRequestWithProfile[]> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { data: rows, error } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('to_user', authUser.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachProfiles(rows ?? [], 'from_user');
}

/** Fetch pending outgoing requests (I'm waiting for them to accept). */
export async function listOutgoingRequests(): Promise<FriendRequestWithProfile[]> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { data: rows, error } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('from_user', authUser.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachProfiles(rows ?? [], 'to_user');
}

async function attachProfiles(
  rows: {
    id: string;
    from_user: string;
    to_user: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    responded_at: string | null;
  }[],
  counterpartyKey: 'from_user' | 'to_user'
): Promise<FriendRequestWithProfile[]> {
  if (rows.length === 0) return [];

  const ids = Array.from(new Set(rows.map((r) => r[counterpartyKey])));
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);

  if (error) throw error;

  const byId = new Map((profiles ?? []).map((p) => [p.id, toUser(p)]));

  return rows.map((row) => ({
    ...toFriendRequest(row),
    profile: byId.get(row[counterpartyKey]) ?? {
      id: row[counterpartyKey],
      name: 'Unknown',
      email: '',
    },
  }));
}

// ---------------------------------------------------------------------------
// Mutations (via RPCs)
// ---------------------------------------------------------------------------

/** Send a friend request to another user. */
export async function sendFriendRequest(toUserId: string): Promise<FriendRequest> {
  const { data, error } = await supabase.rpc('send_friend_request', {
    p_to_user: toUserId,
  });
  if (error) throw error;
  return toFriendRequest(
    data as Parameters<typeof toFriendRequest>[0]
  );
}

/** Accept a pending friend request (creates bidirectional friendship). */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('accept_friend_request', {
    p_request_id: requestId,
  });
  if (error) throw error;
}

/** Reject / cancel a pending friend request. */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('reject_friend_request', {
    p_request_id: requestId,
  });
  if (error) throw error;
}

/** Remove a friendship (both directions). */
export async function removeFriend(friendId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_friend', {
    p_friend_id: friendId,
  });
  if (error) throw error;
}
