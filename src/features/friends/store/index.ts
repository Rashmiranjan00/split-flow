import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/shared/services/storage';
import { User } from '@/shared/types';
import { MOCK_MEMBERS } from '@/shared/data/mockData';

interface FriendState {
  friends: User[];
  addFriend: (friend: User) => void;
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
