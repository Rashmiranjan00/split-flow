/**
 * Rounding Safety Utility
 * Money calculations must avoid floating point errors.
 * Use integer cents internally.
 */

export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

export const fromCents = (cents: number): number => {
  return cents / 100;
};
