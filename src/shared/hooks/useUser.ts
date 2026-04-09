import { useAuthStore } from '@/features/auth/store';

export const useUser = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    logout,
    userId: user?.id || 'usr_1', // Fallback for safety, though store should be truth
  };
};
