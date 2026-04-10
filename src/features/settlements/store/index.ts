import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/shared/services/storage';
import { Settlement } from '@/shared/types';

interface SettlementState {
  settlements: Settlement[];
  addSettlement: (settlement: Settlement) => void;
  removeSettlement: (id: string) => void;
}

export const useSettlementStore = create<SettlementState>()(
  persist(
    (set) => ({
      settlements: [],
      addSettlement: (settlement) => set((state) => ({ 
        settlements: [...state.settlements, settlement] 
      })),
      removeSettlement: (id) => set((state) => ({
        settlements: state.settlements.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'settlements-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
