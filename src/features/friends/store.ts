import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/services/storage';
import { Friend } from '@/types';

interface FriendState {
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
}

export const useFriendStore = create<FriendState>()(
  persist(
    (set) => ({
      friends: [],
      addFriend: (friend) => set((state) => ({ friends: [...state.friends, friend] })),
      removeFriend: (id) => set((state) => ({
        friends: state.friends.filter(f => f.id !== id)
      })),
    }),
    {
      name: 'friends-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
