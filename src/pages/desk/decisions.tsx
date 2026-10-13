import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, ListChecks, Loader2, RefreshCw } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { DecisionsResponse, trading } from '@/lib/trading';

const KIND: Record<string, { label: string; style: string }> = {
  touch: { label: 'touch', style: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60' },
  refused: { label: 'refused', style: 'bg-amber-900/50 text-amber-200 border-amber-700/60' },
  sizing: { label: 'sizing', style: 'bg-amber-900/50 text-amber-200 border-amber-700/60' },
  entry: { label: 'entry', style: 'bg-emerald-900/50 text-emerald-200 border-emerald-700/60' },
  entry_failed: { label: 'not filled', style: 'bg-rose-900/50 text-rose-200 border-rose-700/60' },
  exit: { label: 'exit', style: 'bg-sky-900/50 text-sky-200 border-sky-700/60' },
  booked: { label: 'booked', style: 'bg-sky-900/50 text-sky-200 border-sky-700/60' },
  exit_failed: { label: 'exit stuck', style: 'bg-rose-900/50 text-rose-200 border-rose-700/60' },
  stop_wait: { label: 'stop watch', style: 'bg-slate-800 text-slate-300 border-slate-700' },
  floor: { label: 'account floor', style: 'bg-rose-900/50 text-rose-200 border-rose-700/60' },
  halt: { label: 'halt', style: 'bg-rose-900/50 text-rose-200 border-rose-700/60' },
  macro: { label: 'macro', style: 'bg-slate-800 text-slate-300 border-slate-700' },
};

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

function DecisionsView() {
  const [date, setDate] = useState(today());
  const [data, setData] = useState<DecisionsResponse | null>(null);
  const [only, setOnly] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setData(null);
    setError(null);
    trading.decisions(date).then(setData).catch((e: Error) => setError(e.message));
  }, [date]);
  useEffect(load, [load]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    data?.events.forEach((e) => { m[e.kind] = (m[e.kind] ?? 0) + 1; });
    return m;
  }, [data]);
  const events = useMemo(
    () => (data?.events ?? []).filter((e) => only === 'all' || e.kind === only),
    [data, only]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2"><ListChecks className="w-4 h-4" /> Auto-Trader · decisions</div>
          <h1 className="text-3xl font-bold text-white">Why it traded, or didn&apos;t</h1>
          <p className="text-slate-400 text-sm mt-1">Band touches and the reason each was taken or refused, sizing, entries, exits, and the settings changed that day. Times are New York.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <button onClick={load} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {error && <div className="mb-6 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</div>}

      <div className="flex flex-wrap gap-1 mb-4">
        {['all', ...Object.keys(counts)].map((k) => (
          <button key={k} onClick={() => setOnly(k)}
            className={clsx('px-3 py-1.5 text-xs rounded-md border', only === k ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white')}>
            {k === 'all' ? `all (${data?.events.length ?? 0})` : `${KIND[k]?.label ?? k} (${counts[k]})`}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 font-semibold text-white">Events</div>
          {!data ? (
            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
          ) : events.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Nothing recorded for this day.</div>
          ) : (
            <div className="overflow-x-auto max-h-[720px]">
              <table className="w-full text-sm">
                <tbody>
                  {events.map((e, i) => (
                    <tr key={i} className="border-t border-slate-800/70 align-top">
                      <td className="px-4 py-2 text-slate-400 whitespace-nowrap tabular-nums">{e.et}</td>
                      <td className="px-2 py-2 whitespace-nowrap"><span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', KIND[e.kind]?.style ?? KIND.macro.style)}>{KIND[e.kind]?.label ?? e.kind}</span></td>
                      <td className={clsx('px-3 py-2', e.level === 'ERROR' ? 'text-rose-300' : 'text-slate-200')}>{e.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-slate-800 font-semibold text-white">Settings changed</div>
          {!data ? null : data.settings_changes.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">No settings changed this day.</div>
          ) : (
            <div className="overflow-y-auto max-h-[720px]">
              <table className="w-full text-xs">
                <tbody>
                  {data.settings_changes.map((c, i) => (
                    <tr key={i} className="border-t border-slate-800/70 align-top">
                      <td className="px-3 py-2 text-slate-400 whitespace-nowrap tabular-nums">{c.et}</td>
                      <td className="px-2 py-2 text-slate-200 break-all">{c.key.replace(/^TRADING_/, '')}</td>
                      <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{c.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DecisionsPage() {
  return (
    <>
      <Head><title>Decisions — Data AI Systems</title></Head>
      <RequireAuth roles={['admin', 'trader']}>
        <DecisionsView />
      </RequireAuth>
    </>
  );
}
