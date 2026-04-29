import { queryClient } from '@/shared/services/queryClient';
import { useAuthStore } from '@/features/auth/store';
import { signOut } from '@/services/supabase/auth';

/**
 * Clears all user-specific app state on sign-out.
 * Call this before navigating to the auth screen.
 */
export const resetAppState = () => {
  signOut().catch(() => {});
  useAuthStore.getState().logout();
  queryClient.clear();
};
