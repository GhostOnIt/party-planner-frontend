import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, setUser, logout } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    setAuth,
    setUser,
    logout,
  };
}
