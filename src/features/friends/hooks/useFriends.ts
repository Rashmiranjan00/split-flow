import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listFriends } from '@/services/supabase/friends';

/**
 * Hook to access friends and related metadata.
 */
export const useFriends = () => {
  const { data: friends = [], isLoading, error } = useQuery({
    queryKey: queryKeys.friends,
    queryFn: listFriends,
  });

  return {
    friends,
    isEmpty: friends.length === 0,
    totalFriends: friends.length,
    isLoading,
    error,
  };
};
