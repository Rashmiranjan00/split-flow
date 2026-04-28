import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import {
  listIncomingRequests,
  listOutgoingRequests,
} from '@/services/supabase/friends';
import { useUser } from '@/shared/hooks/useUser';

/**
 * Hook to access pending friend requests (incoming and outgoing).
 *
 * Incoming = someone else asked to be my friend; I can accept / reject.
 * Outgoing = I asked someone to be my friend; status is 'pending' until they
 *            accept or reject. I can cancel via rejectFriendRequest.
 *
 * Uses `placeholderData` to avoid a loading spinner on mount.
 */
export const useFriendRequests = () => {
  const { userId } = useUser();

  const incomingQuery = useQuery({
    queryKey: [...queryKeys.friendRequests, 'incoming'] as const,
    queryFn: listIncomingRequests,
    enabled: !!userId,
    placeholderData: [],
  });

  const outgoingQuery = useQuery({
    queryKey: [...queryKeys.friendRequests, 'outgoing'] as const,
    queryFn: listOutgoingRequests,
    enabled: !!userId,
    placeholderData: [],
  });

  return {
    incoming: incomingQuery.data ?? [],
    outgoing: outgoingQuery.data ?? [],
    incomingCount: incomingQuery.data?.length ?? 0,
    outgoingCount: outgoingQuery.data?.length ?? 0,
    isLoading: false,
    error: incomingQuery.error ?? outgoingQuery.error,
  };
};
