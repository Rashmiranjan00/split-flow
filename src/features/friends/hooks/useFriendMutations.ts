import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from '@/services/supabase/friends';

/** Send a friend request to another user by their profile id. */
export const useSendFriendRequestMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.friendRequests });
      qc.invalidateQueries({ queryKey: ['user-search'] });
    },
  });
};

/** Accept a pending incoming friend request. Creates the friendship. */
export const useAcceptFriendRequestMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.friendRequests });
      qc.invalidateQueries({ queryKey: queryKeys.friends });
    },
  });
};

/** Reject an incoming request, or cancel an outgoing one. */
export const useRejectFriendRequestMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.friendRequests });
    },
  });
};

/** Remove an existing friendship in both directions. */
export const useRemoveFriendMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.friends });
    },
  });
};
