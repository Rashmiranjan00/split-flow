/**
 * DTO mappers: Supabase snake_case + integer minor units <-> canonical camelCase + float dollars.
 *
 * Every service module passes raw Supabase rows through these before returning
 * to hooks/screens, so the rest of the app never sees the DB shape.
 */

import { fromCents, toCents } from '@/shared/utils/money';

import type { Database } from './database.types';
import type {
  Expense,
  FriendRequest,
  Group,
  Settlement,
  SplitDetail,
  User,
} from '@/shared/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type GroupRow = Database['public']['Tables']['groups']['Row'];
type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type ExpenseSplitRow = Database['public']['Tables']['expense_splits']['Row'];
type SettlementRow = Database['public']['Tables']['settlements']['Row'];
type FriendRequestRow = Database['public']['Tables']['friend_requests']['Row'];

/** Map a `profiles` row to the canonical `User` type. */
export function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url ?? undefined,
  };
}

/** Map a `groups` row + member ID array to the canonical `Group` type. */
export function toGroup(row: GroupRow, memberIds: string[]): Group {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    members: memberIds,
    createdAt: row.created_at,
    coverImage: row.cover_image ?? undefined,
  };
}

/** Map an `expenses` row + related participant/split rows to the canonical `Expense` type. */
export function toExpense(
  row: ExpenseRow,
  participantIds: string[],
  splits: ExpenseSplitRow[]
): Expense {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    amount: fromCents(row.amount_minor),
    paidBy: row.paid_by,
    participants: participantIds,
    splitDetails: splits.map(toSplitDetail),
    createdAt: row.created_at,
    category: row.category ?? undefined,
    splitType: row.split_type as Expense['splitType'],
  };
}

/** Map an `expense_splits` row to the canonical `SplitDetail`. */
export function toSplitDetail(row: ExpenseSplitRow): SplitDetail {
  return {
    userId: row.user_id,
    owedAmount: fromCents(row.owed_minor),
  };
}

/** Map a `settlements` row to the canonical `Settlement` type. */
export function toSettlement(row: SettlementRow): Settlement {
  return {
    id: row.id,
    groupId: row.group_id,
    from: row.from_user,
    to: row.to_user,
    amount: fromCents(row.amount_minor),
    createdAt: row.created_at,
  };
}

/** Map a `friend_requests` row to the canonical `FriendRequest` type. */
export function toFriendRequest(row: FriendRequestRow): FriendRequest {
  return {
    id: row.id,
    fromUser: row.from_user,
    toUser: row.to_user,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at ?? undefined,
  };
}

// ---- Reverse mappers (canonical -> Supabase payloads) ----

/** Build the args for the `create_expense` RPC from canonical form values. */
export function toCreateExpensePayload(values: {
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  splitType: string;
  category?: string;
  participants: string[];
  splitDetails: SplitDetail[];
}) {
  return {
    p_group_id: values.groupId,
    p_title: values.title,
    p_amount_minor: toCents(values.amount),
    p_paid_by: values.paidBy,
    p_split_type: values.splitType,
    p_category: values.category ?? null,
    p_participants: values.participants,
    p_splits: values.splitDetails.map((s) => ({
      userId: s.userId,
      owedMinor: toCents(s.owedAmount),
    })),
  };
}

/** Build an insert row for `settlements` from canonical values. */
export function toCreateSettlementPayload(values: {
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
}) {
  return {
    group_id: values.groupId,
    from_user: values.fromUser,
    to_user: values.toUser,
    amount_minor: toCents(values.amount),
  };
}
