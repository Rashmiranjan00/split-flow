/**
 * Theme-mode store.
 *
 * The "Warm Minimalist Finance" revamp is light-mode-only. This hook keeps the
 * same selector-style API that the previous persisted Zustand store exposed,
 * so downstream UI (the Light / Dark / System pills in Profile) keeps
 * compiling without edits. `mode` is always `'light'` and `setMode` is a
 * no-op. Any previously persisted value in AsyncStorage (`splitflow-theme`)
 * is intentionally ignored.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStoreState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const state: ThemeStoreState = {
  mode: 'light',
  setMode: () => {
    /* no-op until dark-mode support returns */
  },
};

/**
 * Accepts an optional selector for API parity with the previous Zustand store.
 * When omitted, returns the whole state object.
 */
export function useThemeStore<T>(selector: (s: ThemeStoreState) => T): T;
export function useThemeStore(): ThemeStoreState;
export function useThemeStore<T>(
  selector?: (s: ThemeStoreState) => T
): T | ThemeStoreState {
  return selector ? selector(state) : state;
}
