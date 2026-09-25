import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { CheckCircle2, Loader2, Lock, LogIn } from 'lucide-react';
import { MIN_PASSWORD_LENGTH, resetPassword } from '@/lib/auth';
import PasswordInput from '@/components/PasswordInput';

/**
 * The page the emailed reset link opens: /reset-password?token=...
 *
 * The API (helpers/mailer.py, PASSWORD_RESET_PAGE) builds the link to land
 * here. Unlike /forgot-password this page DOES show the API's error, and
 * should: the visitor is holding a token and needs to know whether it is
 * expired, already used, or simply wrong.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'That did not work. Request a new link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Choose a new password — Data AI Systems</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Choose a new password</h1>
                <p className="text-slate-400 text-sm">At least {MIN_PASSWORD_LENGTH} characters. The link works once.</p>
              </div>
            </div>

            {done ? (
              <div className="space-y-5">
                <div className="flex gap-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 text-emerald-200 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>Password set. You can sign in with it now.</p>
                </div>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </Link>
              </div>
            ) : !router.isReady ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : !token ? (
              <div className="space-y-5">
                <div className="text-sm text-amber-200 bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-3">
                  This link is missing its token. Open the link from the email exactly as sent, or request a
                  new one.
                </div>
                <Link href="/forgot-password" className="text-sm text-indigo-300 hover:text-indigo-200">
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">New password</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <PasswordInput
                      autoComplete="new-password"
                      required
                      autoFocus
                      minLength={MIN_PASSWORD_LENGTH}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-slate-100 outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Confirm new password</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <PasswordInput
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-slate-100 outline-none"
                    />
                  </div>
                </label>

                {error && (
                  <div className="text-sm text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">
                    {error}{' '}
                    {/expired|already been used|not valid/i.test(error) && (
                      <Link href="/forgot-password" className="underline hover:text-rose-200">
                        Request a new link.
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Set password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
