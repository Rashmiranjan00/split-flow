/**
 * Supabase data service — Expenses.
 */

import { supabase } from './supabase';
import { toExpense, toCreateExpensePayload } from './mappers';
import type { Expense, SplitDetail } from '@/shared/types';

/** Fetch all expenses for a group, newest first. */
export async function listExpensesByGroup(groupId: string): Promise<Expense[]> {
  const { data: expenseRows, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!expenseRows || expenseRows.length === 0) return [];

  const expenseIds = expenseRows.map((e) => e.id);

  const [participantsRes, splitsRes] = await Promise.all([
    supabase
      .from('expense_participants')
      .select('expense_id, user_id')
      .in('expense_id', expenseIds),
    supabase
      .from('expense_splits')
      .select('expense_id, user_id, owed_minor')
      .in('expense_id', expenseIds),
  ]);

  if (participantsRes.error) throw participantsRes.error;
  if (splitsRes.error) throw splitsRes.error;

  const participantsByExpense = new Map<string, string[]>();
  for (const row of participantsRes.data ?? []) {
    const arr = participantsByExpense.get(row.expense_id) ?? [];
    arr.push(row.user_id);
    participantsByExpense.set(row.expense_id, arr);
  }

  const splitsByExpense = new Map<
    string,
    { expense_id: string; user_id: string; owed_minor: number }[]
  >();
  for (const row of splitsRes.data ?? []) {
    const arr = splitsByExpense.get(row.expense_id) ?? [];
    arr.push(row);
    splitsByExpense.set(row.expense_id, arr);
  }

  return expenseRows.map((row) =>
    toExpense(
      row,
      participantsByExpense.get(row.id) ?? [],
      splitsByExpense.get(row.id) ?? []
    )
  );
}

/** Fetch a single expense by ID. */
export async function getExpense(expenseId: string): Promise<Expense> {
  const { data: row, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .single();

  if (error) throw error;

  const [participantsRes, splitsRes] = await Promise.all([
    supabase
      .from('expense_participants')
      .select('user_id')
      .eq('expense_id', expenseId),
    supabase
      .from('expense_splits')
      .select('expense_id, user_id, owed_minor')
      .eq('expense_id', expenseId),
  ]);

  if (participantsRes.error) throw participantsRes.error;
  if (splitsRes.error) throw splitsRes.error;

  return toExpense(
    row,
    (participantsRes.data ?? []).map((p) => p.user_id),
    splitsRes.data ?? []
  );
}

/** Create an expense atomically via the `create_expense` RPC. */
export async function createExpense(values: {
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  splitType: string;
  category?: string;
  participants: string[];
  splitDetails: SplitDetail[];
}): Promise<string> {
  const payload = toCreateExpensePayload(values);

  const { data, error } = await supabase.rpc('create_expense', payload);

  if (error) throw error;
  return data as string;
}
