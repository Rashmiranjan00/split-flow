import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

// ES2019: point-free async wrappers — avoids unnecessary intermediate variables
// getItem returns the AsyncStorage promise directly (null coalescing handled by AsyncStorage itself)
export const zustandStorage: StateStorage = {
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  getItem: async (name) => (await AsyncStorage.getItem(name)) ?? null,
  removeItem: (name) => AsyncStorage.removeItem(name),
};
