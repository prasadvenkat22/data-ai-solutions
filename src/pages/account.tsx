import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, Lock, Mail, Shield, UserCircle2 } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { MIN_PASSWORD_LENGTH, changePassword } from '@/lib/auth';
import PasswordInput from '@/components/PasswordInput';

/**
 * The signed-in user's own account: who they are, and a change-password form
 * against POST /auth/change-password. Requiring the current password is what
 * keeps a borrowed session from becoming a permanent takeover, so the form
 * asks for it even though the user is already signed in. The API mails a
 * notice after a change, for the case where it was not them.
 */
function AccountInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next !== confirm) {
      setError('The two new passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Change failed');
    } finally {
      setBusy(false);
    }
  };

  // Back to wherever they came from; home if this tab opened straight here.
  const cancel = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setError(null);
    if (window.history.length > 1) router.back();
    else void router.push('/');
  };

  // Works while signed in: the reset link sets a new password without asking
  // for the old one, and this session's tokens stay valid until they expire.
  const forgotHref = `/forgot-password?email=${encodeURIComponent(user?.email ?? '')}`;

  const field = (
    label: string,
    value: string,
    set: (v: string) => void,
    autoComplete: string,
    minLength?: number
  ) => (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
        <Lock className="w-4 h-4 text-slate-500" />
        <PasswordInput
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => set(e.target.value)}
          className="w-full bg-transparent py-2.5 text-slate-100 outline-none"
        />
      </div>
    </label>
  );

  return (
    <>
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white truncate">{user?.name || 'Your account'}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
              <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> {user?.role ?? 'no role'}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change password</h2>
              <p className="text-slate-400 text-sm">
                At least {MIN_PASSWORD_LENGTH} characters. You will get an email confirming the change.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 max-w-md">
            {field('Current password', current, setCurrent, 'current-password')}
            {field('New password', next, setNext, 'new-password', MIN_PASSWORD_LENGTH)}
            {field('Confirm new password', confirm, setConfirm, 'new-password')}

            {error && (
              <div className="text-sm text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">{error}</div>
            )}
            {done && (
              <div className="flex items-center gap-2 text-sm text-emerald-200 bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4" /> Password changed. Your current session stays signed in.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Change password
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={busy}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 disabled:opacity-60"
              >
                Cancel
              </button>
              <Link href={forgotHref} className="text-sm text-indigo-300 hover:text-indigo-200 sm:ml-auto">
                Forgot your current password?
              </Link>
            </div>
          </form>
        </div>

        <p className="text-xs text-slate-500 mt-6 flex items-start gap-2">
          <UserCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          “Forgot your current password?” emails you a reset link. It sets a new password without asking for
          the old one, and you stay signed in here.
        </p>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <>
      <Head><title>Your account — Data AI Systems</title></Head>
      <RequireAuth>
        <AccountInner />
      </RequireAuth>
    </>
  );
}
