import { useUser } from '@/shared/hooks/useUser';
import { 
  getGroupBalance, 
  getTotalBalance, 
  getGroupMemberBalances 
} from '@/shared/data/mockData';
import { useMemo } from 'react';

export const useBalances = () => {
  const { userId } = useUser();

  const totalBalance = useMemo(() => getTotalBalance(userId), [userId]);

  return {
    totalBalance,
    useGroupBalance: (groupId: string) => useMemo(() => getGroupBalance(groupId, userId), [groupId, userId]),
    useMemberBalances: (groupId: string) => useMemo(() => getGroupMemberBalances(groupId, userId), [groupId, userId]),
  };
};

export const useGroupBalanceHook = (groupId: string) => {
  const { userId } = useUser();
  return useMemo(() => getGroupBalance(groupId, userId), [groupId, userId]);
};

export const useTotalBalanceHook = () => {
  const { userId } = useUser();
  return useMemo(() => getTotalBalance(userId), [userId]);
};
