import { useAuthStore } from '@/features/auth/store';
import { useFriendStore } from '@/features/friends/store';
import { useGroupStore } from '@/features/groups/store';
import { useExpenseStore } from '@/features/expenses/store';
import { useSettlementStore } from '@/features/settlements/store';
import {
  DEMO_CURRENT_USER,
  DEMO_FRIENDS,
  DEMO_GROUPS,
  DEMO_EXPENSES,
  DEMO_SETTLEMENTS,
} from './mockData';

/**
 * Populate every Zustand store with the demo dataset defined in
 * `src/shared/data/mockData.ts`. Triggered by the "Load demo data" row on the
 * Profile screen.
 */
export const seedDemoData = () => {
  useAuthStore.setState({ user: DEMO_CURRENT_USER, isAuthenticated: true });
  useFriendStore.setState({ friends: DEMO_FRIENDS });
  useGroupStore.setState({ groups: DEMO_GROUPS });
  useExpenseStore.setState({ expenses: DEMO_EXPENSES });
  useSettlementStore.setState({ settlements: DEMO_SETTLEMENTS });
};

/**
 * Reverse of `seedDemoData()` — clears all demo content but leaves the
 * auth session intact so the user doesn't get kicked back to the login
 * screen. Triggered by the "Clear demo data" row on the Profile screen.
 */
export const clearDemoData = () => {
  useFriendStore.setState({ friends: [] });
  useGroupStore.setState({ groups: [] });
  useExpenseStore.setState({ expenses: [] });
  useSettlementStore.setState({ settlements: [] });
};
