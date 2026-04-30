/**
 * Supabase data service — Settlements.
 */

import { supabase } from './supabase';
import { toSettlement, toCreateSettlementPayload } from './mappers';
import type { Settlement } from '@/shared/types';

/** Fetch all settlements for a group, newest first. */
export async function listSettlementsByGroup(groupId: string): Promise<Settlement[]> {
  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toSettlement);
}

/** Record a new settlement. */
export async function createSettlement(values: {
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  note?: string;
}): Promise<Settlement> {
  const payload = toCreateSettlementPayload(values);

  const { data, error } = await supabase.from('settlements').insert(payload).select().single();

  if (error) throw error;
  return toSettlement(data);
}
