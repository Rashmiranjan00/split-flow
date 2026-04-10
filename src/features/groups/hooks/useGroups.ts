import { useGroupStore } from '../store';

/**
 * Hook to access groups and related loading/empty states.
 */
export const useGroups = () => {
  const groups = useGroupStore((state) => state.groups);
  
  return {
    groups,
    isEmpty: groups.length === 0,
    totalGroups: groups.length,
  };
};

/**
 * Hook to access a single group by ID.
 */
export const useGroup = (groupId: string) => {
  const group = useGroupStore((state) => 
    state.groups.find((g) => g.id === groupId)
  );

  return {
    group,
    exists: !!group,
  };
};
