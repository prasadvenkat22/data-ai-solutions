import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bell, CheckCircle2 } from 'lucide-react';
import SubscribeForm from '@/components/SubscribeForm';

/**
 * Product updates: the sign-up and nothing else. The contact page has a demo
 * form with a preferred-time field beside a small updates card, and the two
 * read as one form; this page exists so "Get updates" is only that. The API's
 * confirm and unsubscribe links land here too (?updates=confirmed | expired |
 * invalid | unsubscribed).
 */

const BANNERS: Record<string, { tone: 'emerald' | 'amber' | 'slate'; text: string }> = {
  confirmed: { tone: 'emerald', text: 'You are on the list. Thank you — updates will come from services@dataaisys.com.' },
  unsubscribed: { tone: 'slate', text: 'You have been unsubscribed. Nothing more will be sent to that address.' },
  expired: { tone: 'amber', text: 'That confirmation link has expired. Sign up again below and we will send a fresh one.' },
  invalid: { tone: 'amber', text: 'That link is not valid. If you meant to sign up for updates, use the form below.' },
};

const TONE = {
  emerald: 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200',
  amber: 'bg-amber-900/30 border-amber-700/50 text-amber-200',
  slate: 'bg-slate-800/60 border-slate-700 text-slate-300',
};

export default function UpdatesPage() {
  const router = useRouter();
  const banner = typeof router.query.updates === 'string' ? BANNERS[router.query.updates] : undefined;

  return (
    <>
      <Head>
        <title>Get updates — Data AI Systems</title>
        <meta name="description" content="Occasional news on the FinAI Options Auto-Trader and Data AI Systems' data and AI work. Confirm by email, unsubscribe in one click." />
      </Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-700/50 rounded-full px-4 py-1.5 mb-5">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">Product updates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Get updates</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Occasional news on the FinAI Options Auto-Trader and our data and AI work. This is a mailing
            list, not an account: no password, nothing to sign in to. You confirm by email and can leave
            in one click from any message.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {banner && (
          <div className={`border rounded-xl px-4 py-3 text-sm ${TONE[banner.tone]}`}>{banner.text}</div>
        )}

        <div className="bg-slate-900 border border-indigo-800/50 rounded-2xl p-8 relative">
          <SubscribeForm source="updates" />
        </div>

        <ul className="grid sm:grid-cols-3 gap-4 text-sm text-slate-400">
          {[
            'A few messages a year, when there is something to say.',
            'Nothing is sent until you click the confirmation link.',
            'Unsubscribe is one click and needs no login.',
          ].map((t) => (
            <li key={t} className="flex gap-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />{t}
            </li>
          ))}
        </ul>

        <p className="text-sm text-slate-500">
          Want a demo, or access to the trading desk as an investor? That is a conversation, not a list —{' '}
          <Link href="/contact" className="text-indigo-300 hover:text-indigo-200">use the contact form</Link>.
        </p>
      </section>
    </>
  );
}
