import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { addFriendByEmail } from '@/services/supabase/friends';

export const useAddFriendMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: addFriendByEmail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.friends });
    },
  });
};
