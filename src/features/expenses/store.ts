import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/services/storage';
import { Expense } from '@/types';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, update: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (id, update) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...update } : e)
      })),
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),
    }),
    {
      name: 'expenses-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
