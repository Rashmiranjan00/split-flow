import type { Expense } from '@/shared/types';

export type TimeBucketGranularity = 'day' | 'week' | 'month';

export interface TimeBucket {
  /** Millisecond timestamp of the start of the bucket (local time). */
  timestamp: number;
  /** Short human-facing label — "Apr 14", "Apr 14-20", "Apr 2026". */
  label: string;
  /** Sum of `expense.amount` inside this bucket. */
  total: number;
}

const MS_PER_DAY = 86_400_000;

const startOfDay = (d: Date): Date => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
};

const startOfWeek = (d: Date): Date => {
  const out = startOfDay(d);
  const weekday = out.getDay();
  out.setDate(out.getDate() - weekday);
  return out;
};

const startOfMonth = (d: Date): Date => {
  const out = startOfDay(d);
  out.setDate(1);
  return out;
};

const addDays = (d: Date, days: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

const addMonths = (d: Date, months: number): Date => {
  const out = new Date(d);
  out.setMonth(out.getMonth() + months);
  return out;
};

const formatBucketLabel = (date: Date, granularity: TimeBucketGranularity): string => {
  if (granularity === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (granularity === 'week') {
    const end = addDays(date, 6);
    const sameMonth = date.getMonth() === end.getMonth();
    const startLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = sameMonth
      ? String(end.getDate())
      : end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startLabel}-${endLabel}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Pick a sensible bucket granularity given a min→max date span.
 *
 * - Up to 14 days → daily buckets (for recent activity).
 * - Up to 90 days → weekly buckets.
 * - Anything longer → monthly buckets.
 */
export const pickGranularity = (minMs: number, maxMs: number): TimeBucketGranularity => {
  const spanDays = Math.max(1, (maxMs - minMs) / MS_PER_DAY);
  if (spanDays <= 14) return 'day';
  if (spanDays <= 90) return 'week';
  return 'month';
};

/**
 * Bucket expenses by creation date, choosing day/week/month granularity
 * automatically from the overall date span. Empty buckets between the first
 * and last expense are filled with `0` so line charts render continuous
 * gridlines.
 *
 * Returns an empty array when there are no expenses.
 */
export const groupExpensesByDate = (expenses: Expense[]): TimeBucket[] => {
  if (expenses.length === 0) return [];

  const timestamps = expenses.map((e) => new Date(e.createdAt).getTime());
  const minMs = Math.min(...timestamps);
  const maxMs = Math.max(...timestamps);
  const granularity = pickGranularity(minMs, maxMs);

  const bucketStartOf = (d: Date): Date => {
    if (granularity === 'day') return startOfDay(d);
    if (granularity === 'week') return startOfWeek(d);
    return startOfMonth(d);
  };

  const advance = (d: Date): Date => {
    if (granularity === 'day') return addDays(d, 1);
    if (granularity === 'week') return addDays(d, 7);
    return addMonths(d, 1);
  };

  const totals = new Map<number, number>();
  for (const expense of expenses) {
    const bucketTs = bucketStartOf(new Date(expense.createdAt)).getTime();
    totals.set(bucketTs, (totals.get(bucketTs) ?? 0) + expense.amount);
  }

  const first = bucketStartOf(new Date(minMs));
  const last = bucketStartOf(new Date(maxMs));
  const out: TimeBucket[] = [];

  let cursor = first;
  while (cursor.getTime() <= last.getTime()) {
    const ts = cursor.getTime();
    out.push({
      timestamp: ts,
      label: formatBucketLabel(cursor, granularity),
      total: totals.get(ts) ?? 0,
    });
    cursor = advance(cursor);
  }

  return out;
};
