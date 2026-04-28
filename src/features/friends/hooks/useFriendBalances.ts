import { useMemo } from 'react';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useUser } from '@/shared/hooks/useUser';

export type FriendBalanceTone = 'positive' | 'negative' | 'settled';

export interface FriendBalance {
  /** Net amount between the current user and this friend, across all groups.
   *  > 0  -> the friend owes me
   *  < 0  -> I owe the friend
   *  = 0  -> settled up */
  net: number;
  tone: FriendBalanceTone;
}

/**
 * Derives the per-friend net balance by folding `simplifiedDebts` from all
 * groups (courtesy of `useBalances`) keyed by friend id.
 */
export const useFriendBalances = () => {
  const { userId } = useUser();
  const { simplifiedDebts, isLoading } = useBalances();

  const balances = useMemo(() => {
    const map = new Map<string, number>();

    for (const debt of simplifiedDebts) {
      if (debt.from === userId) {
        map.set(debt.to, (map.get(debt.to) ?? 0) - debt.amount);
      } else if (debt.to === userId) {
        map.set(debt.from, (map.get(debt.from) ?? 0) + debt.amount);
      }
    }

    return map;
  }, [simplifiedDebts, userId]);

  const getBalance = (friendId: string): FriendBalance => {
    const net = balances.get(friendId) ?? 0;
    const tone: FriendBalanceTone =
      net > 0 ? 'positive' : net < 0 ? 'negative' : 'settled';
    return { net, tone };
  };

  return {
    getBalance,
    isLoading,
    totalNet: Array.from(balances.values()).reduce((acc, v) => acc + v, 0),
  };
};
