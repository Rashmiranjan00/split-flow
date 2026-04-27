/**
 * Supabase data service — Friends.
 */

import { supabase } from './supabase';
import { toUser } from './mappers';
import type { User } from '@/shared/types';

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

/** Add a friend by their email address. */
export async function addFriendByEmail(email: string): Promise<User> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (profErr) throw new Error('No user found with that email');

  if (profile.id === authUser.id) {
    throw new Error('You cannot add yourself as a friend');
  }

  const { error } = await supabase.from('friendships').insert({
    owner_id: authUser.id,
    friend_id: profile.id,
  });

  if (error) {
    if (error.code === '23505') throw new Error('Already friends');
    throw error;
  }

  return toUser(profile);
}
