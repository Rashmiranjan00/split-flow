import { useQuery } from '@tanstack/react-query';
import { getGroupMemberProfiles } from '@/services/supabase/groups';
import { useGroup } from '@/features/groups/hooks/useGroups';
import type { User } from '@/shared/types';

/**
 * Resolve full `User` profiles for every member of `groupId`.
 *
 * The existing group detail screen previously looked members up via
 * `useFriends()`, which broke for members who weren't friends of the viewer.
 * This hook fetches directly from the `profiles` table so every member shows
 * up correctly, regardless of friendship status.
 */
export const useGroupMembers = (
  groupId: string
): { members: User[]; isLoading: boolean; error: unknown } => {
  const { group, isLoading: loadingGroup } = useGroup(groupId);

  const memberIds = group?.members ?? [];

  const {
    data: members = [],
    isLoading: loadingMembers,
    error,
  } = useQuery({
    queryKey: ['group-members', groupId, memberIds],
    queryFn: () => getGroupMemberProfiles(memberIds),
    enabled: !!groupId && memberIds.length > 0,
  });

  return {
    members,
    isLoading: loadingGroup || loadingMembers,
    error,
  };
};
