import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, History, Loader2 } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { HistoryResponse, PlaybookStat, TradeHistoryEntry, fmtMoney, fmtNum, fmtPct, trading } from '@/lib/trading';

const pnlColor = (v: number | null | undefined) =>
  v === null || v === undefined ? 'text-slate-400' : v > 0 ? 'text-emerald-400' : v < 0 ? 'text-rose-400' : 'text-slate-300';

function HistoryView() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [playbooks, setPlaybooks] = useState<PlaybookStat[] | null>(null);
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trading.history().then(setData).catch((e: Error) => setError(e.message));
    trading.playbooks().then((r) => setPlaybooks(r.stats)).catch(() => setPlaybooks([]));
  }, []);

  const trades = useMemo(() => {
    if (!data) return [] as TradeHistoryEntry[];
    const cutoff = Date.now() - days * 86_400_000;
    return [...data.trades]
      .filter((t) => (t.closed_at ? new Date(t.closed_at).getTime() >= cutoff : true))
      .sort((a, b) => new Date(b.closed_at ?? 0).getTime() - new Date(a.closed_at ?? 0).getTime());
  }, [data, days]);

  const byUnderlying = useMemo(() => {
    const m = new Map<string, { pnl: number; n: number; wins: number }>();
    trades.forEach((t) => {
      const r = m.get(t.underlying) ?? { pnl: 0, n: 0, wins: 0 };
      r.pnl += t.realized_pnl_dollars;
      r.n += 1;
      r.wins += t.realized_pnl_dollars > 0 ? 1 : 0;
      m.set(t.underlying, r);
    });
    return [...m.entries()].sort((a, b) => b[1].pnl - a[1].pnl);
  }, [trades]);

  const windowPnl = trades.reduce((s, t) => s + t.realized_pnl_dollars, 0);
  const wins = trades.filter((t) => t.realized_pnl_dollars > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2"><History className="w-4 h-4" /> Auto-Trader · closed trades</div>
          <h1 className="text-3xl font-bold text-white">Realized results</h1>
          <p className="text-slate-400 text-sm mt-1">What each exit rule actually booked, at the fill, not the mark.</p>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {[1, 7, 30, 90, 3650].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={clsx('px-3 py-1.5 text-xs rounded-md', days === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>
              {d === 1 ? 'today' : d === 3650 ? 'all' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Window P&amp;L</div><div className={clsx('text-2xl font-bold', pnlColor(windowPnl))}>{fmtMoney(windowPnl)}</div></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Trades</div><div className="text-2xl font-bold text-white">{trades.length}</div><div className="text-xs text-slate-500 mt-1">{trades.length ? `${Math.round((100 * wins) / trades.length)}% winners` : ''}</div></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Best</div><div className="text-2xl font-bold text-emerald-400">{fmtMoney(trades.length ? Math.max(...trades.map((t) => t.realized_pnl_dollars)) : null)}</div></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Worst</div><div className="text-2xl font-bold text-rose-400">{fmtMoney(trades.length ? Math.min(...trades.map((t) => t.realized_pnl_dollars)) : null)}</div></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 font-semibold text-white">Trades</div>
          {!data ? (
            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
          ) : trades.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Nothing closed in this window.</div>
          ) : (
            <div className="overflow-x-auto max-h-[640px]">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500 sticky top-0 bg-slate-900">
                  <tr><th className="text-left px-4 py-3">Closed</th><th className="text-left px-4 py-3">Spread</th><th className="text-right px-4 py-3">Entry → exit</th><th className="text-right px-4 py-3">P&amp;L</th><th className="text-left px-4 py-3">Exit rule</th></tr>
                </thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={i} className="border-t border-slate-800/70">
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{t.closed_at ? new Date(t.closed_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="px-4 py-2.5 text-white">{t.underlying} <span className="text-slate-400">{t.strategy.replace(/_/g, ' ').toLowerCase()}</span> {t.long_strike}/{t.short_strike} ×{t.quantity}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{fmtNum(t.entry_net_debit)} → {fmtNum(t.exit_net_value)}</td>
                      <td className={clsx('px-4 py-2.5 text-right tabular-nums font-semibold', pnlColor(t.realized_pnl_dollars))}>{fmtMoney(t.realized_pnl_dollars)}<div className="text-xs font-normal">{fmtPct(t.realized_pnl_pct)}</div></td>
                      <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{t.close_reason}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 font-semibold text-white">By underlying</div>
            <table className="w-full text-sm">
              <tbody>
                {byUnderlying.map(([u, r]) => (
                  <tr key={u} className="border-t border-slate-800/70">
                    <td className="px-5 py-2.5 text-white font-medium">{u}</td>
                    <td className="px-2 py-2.5 text-slate-400 text-xs">{r.n} trade{r.n === 1 ? '' : 's'} · {Math.round((100 * r.wins) / r.n)}% win</td>
                    <td className={clsx('px-5 py-2.5 text-right tabular-nums font-semibold', pnlColor(r.pnl))}>{fmtMoney(r.pnl)}</td>
                  </tr>
                ))}
                {byUnderlying.length === 0 && <tr><td className="px-5 py-6 text-slate-500 text-center">—</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 font-semibold text-white">Playbooks (all time)</div>
            <table className="w-full text-sm">
              <tbody>
                {(playbooks ?? []).map((s) => (
                  <tr key={s.playbook} className="border-t border-slate-800/70">
                    <td className="px-5 py-2.5"><div className="text-white font-medium">{s.playbook}</div><div className="text-xs text-slate-500">{s.trades} trades · {s.win_rate_pct.toFixed(0)}% win{s.active ? '' : ' · retired'}</div></td>
                    <td className={clsx('px-5 py-2.5 text-right tabular-nums font-semibold', pnlColor(s.total_pnl_dollars))}>{fmtMoney(s.total_pnl_dollars)}</td>
                  </tr>
                ))}
                {playbooks && playbooks.length === 0 && <tr><td className="px-5 py-6 text-slate-500 text-center">no playbook stats</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <>
      <Head><title>Closed trades — Data AI Systems</title></Head>
    <RequireAuth roles={['admin', 'trader']}>
      <HistoryView />
    </RequireAuth>
    </>
  );
}
