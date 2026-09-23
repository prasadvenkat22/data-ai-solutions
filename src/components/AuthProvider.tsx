import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { deskSession, siteSession, type Me, type Session } from '@/lib/auth';

interface AuthState {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Me | null>;
  logout: () => void;
  refresh: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const empty: AuthState = {
  user: null,
  loading: true,
  login: async () => null,
  logout: () => undefined,
  refresh: async () => undefined,
  hasRole: () => false,
};

/** Session state for one token pair; the desk and the site each get one. */
function useSessionState(session: Session): AuthState {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await session.fetchMe());
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await session.login(email, password);
      const me = await session.fetchMe();
      setUser(me);
      return me;
    },
    [session]
  );

  const logout = useCallback(() => {
    session.logout();
    setUser(null);
  }, [session]);

  return useMemo<AuthState>(
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
}

const AuthContext = createContext<AuthState>(empty);
const SiteAuthContext = createContext<AuthState>(empty);

export function AuthProvider({ children }: { children: ReactNode }) {
  const desk = useSessionState(deskSession);
  const site = useSessionState(siteSession);
  return (
    <AuthContext.Provider value={desk}>
      <SiteAuthContext.Provider value={site}>{children}</SiteAuthContext.Provider>
    </AuthContext.Provider>
  );
}

/** The trading-desk session (desk, AI lab, admin pages). */
export const useAuth = () => useContext(AuthContext);
/** The general site's session (Sign in / Sign up), independent of the desk's. */
export const useSiteAuth = () => useContext(SiteAuthContext);
