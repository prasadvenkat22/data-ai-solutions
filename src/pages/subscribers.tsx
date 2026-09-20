import Head from 'next/head';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { Loader2, Mail, Search } from 'lucide-react';
import { api } from '@/lib/api';

type Subscriber = {
  id: number;
  email: string;
  name?: string | null;
  interest?: string | null;
  source?: string | null;
  created_at?: string | null;
  confirmed_at?: string | null;
  unsubscribed_at?: string | null;
};

function stateOf(s: Subscriber) {
  if (s.unsubscribed_at) return { label: 'unsubscribed', cls: 'bg-slate-800 text-slate-400 border-slate-700' };
  if (s.confirmed_at) return { label: 'confirmed', cls: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' };
  return { label: 'awaiting confirmation', cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' };
}

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : '—');

function SubscribersInner() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.subscribers.list().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const shown = rows.filter((r) => r.email.includes(q) || (r.name ?? '').toLowerCase().includes(q));
  const confirmed = rows.filter((r) => r.confirmed_at && !r.unsubscribed_at).length;

  return (
    <>
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Mail className="w-7 h-7 text-indigo-400" /> Updates subscribers</h1>
            <p className="text-slate-400 mt-1 text-sm">
              People who asked for product news. Not accounts: nothing here can sign in. {confirmed} confirmed of {rows.length}.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3">
            <Search className="w-4 h-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="bg-transparent py-2 text-sm text-slate-100 outline-none" />
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No subscribers yet.</div>
        ) : (
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Signed up</th>
                  <th className="text-left px-4 py-3">Confirmed</th>
                  <th className="text-left px-4 py-3">State</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const st = stateOf(r);
                  return (
                    <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-100">{r.email}</td>
                      <td className="px-4 py-3 text-slate-300">{r.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{r.source || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{fmt(r.created_at)}</td>
                      <td className="px-4 py-3 text-slate-400">{fmt(r.confirmed_at)}</td>
                      <td className="px-4 py-3"><span className={`text-xs border rounded-full px-2.5 py-1 ${st.cls}`}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default function SubscribersPage() {
  return (
    <>
      <Head><title>Updates subscribers — Data AI Systems</title></Head>
      <RequireAuth roles={['admin']}>
        <SubscribersInner />
      </RequireAuth>
    </>
  );
}
