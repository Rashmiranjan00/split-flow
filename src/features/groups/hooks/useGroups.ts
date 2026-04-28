import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listMyGroups, getGroup } from '@/services/supabase/groups';

/**
 * Hook to access groups and related loading/empty states.
 */
export const useGroups = () => {
  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: listMyGroups,
  });

  return {
    groups,
    isEmpty: groups.length === 0,
    totalGroups: groups.length,
    isLoading,
    error,
  };
};

/**
 * Hook to access a single group by ID.
 */
export const useGroup = (groupId: string) => {
  const { data: group, isLoading, error } = useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => getGroup(groupId),
    enabled: !!groupId,
  });

  return {
    group,
    exists: !!group,
    isLoading,
    error,
  };
};
