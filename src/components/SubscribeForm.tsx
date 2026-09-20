import { FormEvent, useState } from 'react';
import { CheckCircle2, Loader2, Mail, Send } from 'lucide-react';

/**
 * "Get updates" -- the product-updates list, NOT an account.
 *
 * Posts to POST /api/contact/subscribe without a bearer. The API stores the
 * address unconfirmed and mails one confirmation link; only the click puts
 * the address on the list, and every later mail carries an unsubscribe link.
 * The response is the same whatever happened ("check your inbox"), so the
 * form cannot be used to learn who is on the list. `website` is a honeypot.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function SubscribeForm({ source, compact = false }: { source: string; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/contact/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source, interest: 'Product updates', website }),
      });
      if (res.status === 429) throw new Error('Too many requests from this address. Try again in a minute.');
      if (!res.ok) throw new Error(`Could not sign you up (${res.status}).`);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not sign you up.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-start gap-2 text-sm text-emerald-300">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Check your inbox for a confirmation link. Nothing is sent until you click it.</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-2' : 'space-y-3'}>
      {!compact && (
        <input
          maxLength={120}
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 outline-none focus:border-indigo-500 text-sm"
          autoComplete="name"
        />
      )}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
          <Mail className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent py-2.5 text-slate-100 outline-none text-sm"
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {compact ? '' : 'Get updates'}
        </button>
      </div>
      {/* Honeypot: off-screen, out of the tab order. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <p className="text-xs text-slate-500">Occasional product news. Confirm by email; unsubscribe in one click.</p>
    </form>
  );
}
