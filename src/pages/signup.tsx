import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Loader2, Lock, Mail, MailCheck, User, UserPlus } from 'lucide-react';
import { MIN_PASSWORD_LENGTH, signup } from '@/lib/auth';

const field = 'mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500';
const inputCls = 'w-full bg-transparent py-2.5 text-slate-100 outline-none';

/**
 * Public sign-up for the general site. The account is role 'user' and stays
 * inactive until the emailed link is opened; the trading desk is not reachable
 * from it (the API enforces that, not this page).
 */
export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (password !== confirm) return setError('The passwords do not match.');
    setBusy(true);
    try {
      setDone(await signup(name.trim(), email.trim(), password));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create an account — Data AI Systems</title>
      </Head>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Create an account</h1>
                <p className="text-slate-400 text-sm">We&apos;ll email you a link to activate it.</p>
              </div>
            </div>

            {done ? (
              <div className="text-sm text-emerald-200 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-4 py-4 flex gap-3">
                <MailCheck className="w-5 h-5 shrink-0" />
                <div>
                  {done} If nothing arrives in a few minutes, check spam, or sign up again with the same email to resend it.
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Name</span>
                  <div className={field}>
                    <User className="w-4 h-4 text-slate-500" />
                    <input required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Email</span>
                  <div className={field}>
                    <Mail className="w-4 h-4 text-slate-500" />
                    <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Password</span>
                  <div className={field}>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </div>
                  <span className="text-xs text-slate-500">At least {MIN_PASSWORD_LENGTH} characters.</span>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Confirm password</span>
                  <div className={field}>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
                  </div>
                </label>

                {error && (
                  <div className="text-sm text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Sign up
                </button>
              </form>
            )}

            <p className="text-sm text-slate-400 mt-6">
              Already have an account? <Link href="/signin" className="text-indigo-300 hover:text-indigo-200">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
