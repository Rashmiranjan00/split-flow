/**
 * Supabase auth service — thin wrappers that throw on error.
 */

import { supabase } from './supabase';
import { toUser } from './mappers';
import type { User } from '@/shared/types';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

interface SignInParams {
  email: string;
  password: string;
}

/** Create a new account. The `name` is stored in `raw_user_meta_data` so the
 *  DB trigger can copy it into `profiles.name`. */
export async function signUp({ email, password, name }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

/** Sign in with email + password. */
export async function signIn({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/** End the current session locally. scope:'local' skips the server round-trip
 *  so the auth lock is released immediately, letting a subsequent signIn proceed. */
export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

/** Read the persisted session (non-destructive). */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Fetch the current user's profile row and return a canonical `User`. */
export async function getProfile(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) throw error;
  return toUser(data);
}
