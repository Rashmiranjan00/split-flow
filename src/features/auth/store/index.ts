import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/shared/services/storage';
import { supabase } from '@/services/supabase/supabase';
import { toUser } from '@/services/supabase/mappers';
import type { User } from '@/shared/types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, session: Session) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user, session) =>
        set({ user, session, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, session: null, isAuthenticated: false, isLoading: false }),

      setLoading: (loading) => set({ isLoading: loading }),

      hydrate: async () => {
        const TIMEOUT_MS = 5000;
        try {
          const sessionResult = await Promise.race([
            supabase.auth.getSession(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('getSession timed out')), TIMEOUT_MS)
            ),
          ]);

          const { data: { session } } = sessionResult;

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({
              user: profile ? toUser(profile) : null,
              session,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    useAuthStore.getState().logout();
    return;
  }

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    const { user: authUser } = session;
    const user: User = {
      id: authUser.id,
      email: authUser.email ?? '',
      name: (authUser.user_metadata?.name as string | undefined) ?? authUser.email ?? '',
      avatarUrl: (authUser.user_metadata?.avatar_url as string | undefined) ?? undefined,
    };
    useAuthStore.getState().login(user, session);
  }
});
