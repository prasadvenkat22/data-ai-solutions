import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { safeNext } from '@/lib/auth';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const next = safeNext(router.query.next, '/desk');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void router.replace(next);
  }, [loading, user, next, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      void router.replace(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Trading sign in — Data AI Systems</title>
      </Head>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Trading sign in</h1>
                <p className="text-slate-400 text-sm">Trading desk and AI lab are for registered users.</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-slate-400">Email</span>
                <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-slate-100 outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-slate-400">Password</span>
                <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <PasswordInput
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-slate-100 outline-none"
                  />
                </div>
              </label>

              {error && (
                <div className="text-sm text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign in
              </button>
            </form>

            <div className="mt-4 text-right">
              <Link href="/forgot-password" className="text-sm text-indigo-300 hover:text-indigo-200">
                Forgot password?
              </Link>
            </div>

            <p className="text-xs text-slate-500 mt-6">
              Sessions expire after inactivity. Accounts are created by an administrator; if you have one
              and no password yet, or have forgotten it, use “Forgot password?” to set a new one by email.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Not a trader? <Link href="/signin" className="text-indigo-300 hover:text-indigo-200">Sign in to the site</Link> or{' '}
              <Link href="/signup" className="text-indigo-300 hover:text-indigo-200">create an account</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
