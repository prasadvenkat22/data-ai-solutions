import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthProvider';

/**
 * Wrap a page: anonymous visitors are sent to /login and come back after,
 * signed-in users without one of `roles` see who they are and what the page
 * needs instead of a broken table of 401s.
 */
export default function RequireAuth({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      void router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Checking your session…
      </div>
    );
  }

  if (roles && !hasRole(...roles)) {
    return (
      <div className="max-w-xl mx-auto mt-24 bg-slate-900 border border-amber-700/50 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-white mb-2">This area needs a different role</h2>
        <p className="text-slate-400 text-sm">
          You are signed in as <span className="text-slate-200">{user.email}</span> with role{' '}
          <span className="text-slate-200">{user.role ?? 'none'}</span>. It requires{' '}
          <span className="text-slate-200">{roles.join(' or ')}</span>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
