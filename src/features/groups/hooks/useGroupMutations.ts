import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { createGroup, addGroupMember } from '@/services/supabase/groups';

export const useCreateGroupMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};

export const useAddGroupMemberMutation = (groupId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => addGroupMember(groupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};
