import { useFriendStore } from '../store';

/**
 * Hook to access friends and related metadata.
 */
export const useFriends = () => {
  const friends = useFriendStore((state) => state.friends);

  return {
    friends,
    isEmpty: friends.length === 0,
    totalFriends: friends.length,
  };
};
