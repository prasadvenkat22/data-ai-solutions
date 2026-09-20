import Head from 'next/head';
import { FormEvent, useState } from 'react';
import { AlertCircle, Building2, CalendarCheck, CheckCircle2, Loader2, Mail, MessageSquare, Phone, Send, User } from 'lucide-react';

/**
 * The public contact / book-a-demo form.
 *
 * Posts to POST /api/contact/inquiry with NO bearer -- the one write a visitor
 * can make. Until 2026-09-20 "Book a Free Demo" led to /registrations, whose
 * form posted to an admin-only CRUD route, so every visitor got a 401 and no
 * inquiry was ever recorded. The API stores the inquiry beside the demo
 * registrations, mails the owner (Reply-To the visitor) and acknowledges the
 * visitor.
 *
 * `website` is a honeypot: rendered off-screen, humans never fill it, bots
 * do, and the API answers 202 to both while doing nothing for the bot.
 */

const INTERESTS = [
  'Cloud Migration',
  'Modern Data Platform (Databricks / Snowflake)',
  'Multi-Cloud Integration (Azure / GCP / AWS)',
  'Agentic AI Solutions',
  'BI Solutions',
  'Maintenance & Support',
  'The FinAI Options Auto-Trader',
  'Something else',
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone: string;
  interest: string;
  demo_date: string;
  message: string;
  website: string;
};

const empty: Form = {
  first_name: '', last_name: '', email: '', company: '', phone: '',
  interest: INTERESTS[0], demo_date: '', message: '', website: '',
};

const field = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 outline-none focus:border-indigo-500';

export default function ContactPage() {
  const [form, setForm] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        demo_date: form.demo_date ? new Date(form.demo_date).toISOString() : null,
      };
      const res = await fetch(`${API_BASE}/api/contact/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) throw new Error('Too many requests from this address. Please try again in a minute.');
      if (!res.ok) throw new Error(`Could not send (${res.status}). Please email us instead.`);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send. Please email us instead.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact — Data AI Systems</title>
        <meta name="description" content="Book a free demo or ask Data AI Systems about cloud migrations, modern data platforms, agentic AI, BI and support." />
      </Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Book a free demo, or just ask</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Thirty minutes, tailored to your data stack, no commitment. Tell us what you are working on and a
            person replies — usually within one business day.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {done ? (
            <div className="bg-slate-900 border border-emerald-700/50 rounded-2xl p-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <h2 className="text-xl font-semibold text-white mb-2">Received — thank you.</h2>
              <p className="text-slate-400 text-sm">
                A confirmation is on its way to <span className="text-slate-200">{form.email}</span>. We will be in
                touch{form.demo_date ? ' to confirm a demo time' : ''} shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">First name *</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <User className="w-4 h-4 text-slate-500" />
                    <input required maxLength={80} value={form.first_name} onChange={set('first_name')} className="w-full bg-transparent py-2.5 text-slate-100 outline-none" autoComplete="given-name" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Last name</span>
                  <input maxLength={80} value={form.last_name} onChange={set('last_name')} className={`mt-1 ${field}`} autoComplete="family-name" />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Work email *</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <input type="email" required value={form.email} onChange={set('email')} className="w-full bg-transparent py-2.5 text-slate-100 outline-none" autoComplete="email" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Phone</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <input maxLength={40} value={form.phone} onChange={set('phone')} className="w-full bg-transparent py-2.5 text-slate-100 outline-none" autoComplete="tel" />
                  </div>
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Company</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <input maxLength={120} value={form.company} onChange={set('company')} className="w-full bg-transparent py-2.5 text-slate-100 outline-none" autoComplete="organization" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">I am interested in</span>
                  <select value={form.interest} onChange={set('interest')} className={`mt-1 ${field}`}>
                    {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-slate-400">Preferred demo time (optional)</span>
                <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                  <CalendarCheck className="w-4 h-4 text-slate-500" />
                  <input type="datetime-local" value={form.demo_date} onChange={set('demo_date')} className="w-full bg-transparent py-2.5 text-slate-100 outline-none [color-scheme:dark]" />
                </div>
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-slate-400">What are you working on?</span>
                <div className="mt-1 flex items-start gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 focus-within:border-indigo-500">
                  <MessageSquare className="w-4 h-4 text-slate-500 mt-3" />
                  <textarea rows={5} maxLength={2000} value={form.message} onChange={set('message')} className="w-full bg-transparent py-2.5 text-slate-100 outline-none resize-y" />
                </div>
              </label>

              {/* Honeypot: off-screen, not in the tab order, invisible to people. */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500">We use this only to reply to you.</p>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {busy ? 'Sending…' : 'Send inquiry'}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">What a demo covers</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {['A 30-minute live walkthrough', 'Tailored to your industry and data stack', 'Q&A with the people who build it', 'No commitment'].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400 space-y-2">
            <h3 className="text-white font-semibold mb-1">Prefer email or a call?</h3>
            <p><a href="mailto:venkatangirala@gmail.com" className="text-indigo-300 hover:text-indigo-200">venkatangirala@gmail.com</a></p>
            <p><a href="tel:12018884128" className="text-indigo-300 hover:text-indigo-200">1-201-888-4128</a></p>
            <p className="text-slate-500 text-xs pt-2">On-shore and off-shore teams · 24/7 incident support</p>
          </div>
        </aside>
      </section>
    </>
  );
}
