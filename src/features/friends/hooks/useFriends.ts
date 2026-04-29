import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listFriends } from '@/services/supabase/friends';
import { useUser } from '@/shared/hooks/useUser';

/**
 * Hook to access friends and related metadata.
 *
 * Uses `placeholderData` to render immediately without a loading spinner.
 * The list populates once the fetch completes; if the user has no friends
 * the empty state shows right away instead of a persistent spinner.
 */
export const useFriends = () => {
  const { userId } = useUser();

  const {
    data: friends = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.friends,
    queryFn: listFriends,
    enabled: !!userId,
    placeholderData: [],
  });

  return {
    friends,
    isEmpty: friends.length === 0,
    totalFriends: friends.length,
    isLoading,
    error,
  };
};
