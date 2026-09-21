import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, Mail, MailCheck } from 'lucide-react';
import { forgotPassword } from '@/lib/auth';

/**
 * Ask for a reset link. The API answers 204 whether or not the address has
 * an account, so this page says the same thing either way: it must not be a
 * way to find out which emails are registered. The link in the mail opens
 * /reset-password?token=... on this site.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // /account links here with ?email=... so a signed-in user does not retype it.
  useEffect(() => {
    if (router.isReady && typeof router.query.email === 'string' && !email) {
      setEmail(router.query.email);
    }
  }, [router.isReady, router.query.email, email]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not reach the server. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot password — Data AI Systems</title>
      </Head>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Forgot password</h1>
                <p className="text-slate-400 text-sm">We will email you a link to choose a new one.</p>
              </div>
            </div>

            {sent ? (
              <div className="space-y-5">
                <div className="flex gap-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 text-emerald-200 text-sm">
                  <MailCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    If <span className="text-white">{email.trim()}</span> has an account, a reset link is on its
                    way from services@dataaisys.com. It works once and expires in 30 minutes. Check spam if
                    nothing arrives in a few minutes.
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  No account with that address? Nothing was sent. Accounts are created by an administrator;
                  ask them, or use the <Link href="/contact" className="text-indigo-300 hover:text-indigo-200">contact form</Link>.
                </p>
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Email</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      autoComplete="username"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Email me a reset link
                </button>

                <div className="text-right">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200">
                    <ArrowLeft className="w-4 h-4" /> Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
