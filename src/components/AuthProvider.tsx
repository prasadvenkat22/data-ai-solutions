import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login as apiLogin, logout as apiLogout, type Me } from '@/lib/auth';

interface AuthState {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Me | null>;
  logout: () => void;
  refresh: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => null,
  logout: () => undefined,
  refresh: async () => undefined,
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await fetchMe());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiLogin(email, password);
      const me = await fetchMe();
      setUser(me);
      return me;
    },
    []
  );

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh,
      hasRole: (...roles: string[]) => !!user?.role && roles.includes(user.role),
    }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
