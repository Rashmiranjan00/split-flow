import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { searchUsersByEmail } from '@/services/supabase/friends';
import { useFriendRequests } from './useFriendRequests';
import { useAuthStore } from '@/features/auth/store';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export type UserSearchRowState = 'add' | 'pending-out' | 'pending-in' | 'already-friend';

/**
 * Debounced user search by email. Returns users along with a per-row state so
 * the UI can render the right CTA (Add / Pending / Accept).
 */
export const useUserSearch = (rawQuery: string) => {
  const userId = useAuthStore((s) => s.user?.id);
  const [debounced, setDebounced] = useState(rawQuery.trim());

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(rawQuery.trim()), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [rawQuery]);

  const enabled = debounced.length >= MIN_QUERY_LENGTH && !!userId;

  const query = useQuery({
    queryKey: queryKeys.userSearch(debounced),
    queryFn: () => searchUsersByEmail(debounced, userId!),
    enabled,
  });

  const { incoming, outgoing } = useFriendRequests();

  const results = useMemo(() => {
    const outgoingByTo = new Set(outgoing.map((r) => r.toUser));
    const incomingByFrom = new Map(incoming.map((r) => [r.fromUser, r.id]));

    return (query.data ?? []).map((user) => {
      if (outgoingByTo.has(user.id)) {
        return { user, state: 'pending-out' as UserSearchRowState };
      }
      if (incomingByFrom.has(user.id)) {
        return {
          user,
          state: 'pending-in' as UserSearchRowState,
          requestId: incomingByFrom.get(user.id),
        };
      }
      return { user, state: 'add' as UserSearchRowState };
    });
  }, [query.data, incoming, outgoing]);

  return {
    query: debounced,
    isTooShort: debounced.length > 0 && debounced.length < MIN_QUERY_LENGTH,
    isEmpty: debounced.length === 0,
    isLoading: enabled && query.isLoading,
    isFetching: enabled && query.isFetching,
    results,
    hasResults: results.length > 0,
    error: query.error,
  };
};
