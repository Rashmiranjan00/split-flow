import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/shared/services/storage';
import { Group } from '@/shared/types';
import { MOCK_GROUPS } from '@/shared/data/mockData';

interface GroupState {
  groups: Group[];
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  removeGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
      updateGroup: (id, groupUpdate) => set((state) => ({
        groups: state.groups.map(g => g.id === id ? { ...g, ...groupUpdate } : g)
      })),
      removeGroup: (id) => set((state) => ({
        groups: state.groups.filter(g => g.id !== id)
      })),
    }),
    {
      name: 'groups-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
