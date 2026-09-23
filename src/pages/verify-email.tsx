import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { verifyEmail } from '@/lib/auth';

/** Where the sign-up confirmation mail lands: /verify-email?token=... */
export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = useState<'working' | 'ok' | 'error'>('working');
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    if (!router.isReady || sent.current) return;
    sent.current = true; // StrictMode runs effects twice; spend the token once
    const token = typeof router.query.token === 'string' ? router.query.token : '';
    if (!token) {
      setState('error');
      setError('This link has no token. Open the link from the email exactly as sent.');
      return;
    }
    verifyEmail(token)
      .then(() => setState('ok'))
      .catch((e: Error) => { setState('error'); setError(e.message); });
  }, [router.isReady, router.query.token]);

  return (
    <>
      <Head>
        <title>Confirm your email — Data AI Systems</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          {state === 'working' && (
            <div className="text-slate-300 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Confirming…</div>
          )}
          {state === 'ok' && (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h1 className="text-xl font-semibold text-white mb-2">Your account is active</h1>
              <Link href="/signin" className="inline-block mt-2 px-4 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">Sign in</Link>
            </>
          )}
          {state === 'error' && (
            <>
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h1 className="text-xl font-semibold text-white mb-2">Could not confirm</h1>
              <p className="text-sm text-slate-400 mb-4">{error}</p>
              <Link href="/signup" className="text-indigo-300 hover:text-indigo-200 text-sm">Sign up again to get a new link</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
