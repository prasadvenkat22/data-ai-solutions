import Head from 'next/head';
import { FormEvent, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, LayoutGrid, Loader2, Play } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { ScreenerParams, ScreenerResponse, ScreenerRow, fmtMoney, fmtNum, trading } from '@/lib/trading';

const DEFAULT_SYMBOLS = 'MU,NVDA,TSLA,AVGO,AMZN,AAPL,META,MSFT,GOOGL,AMD,INTC,SNDK';

function nextFriday(): string {
  const d = new Date();
  do d.setDate(d.getDate() + 1); while (d.getDay() !== 5);
  return d.toISOString().slice(0, 10);
}

function RowsTable({ res }: { res: ScreenerResponse }) {
  if (res.rows.length === 0) return <div className="p-8 text-center text-slate-400 text-sm">Nothing cleared the band. {res.warnings.join(' ')}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="text-left px-3 py-2">Spread</th><th className="text-right px-3 py-2">Cost</th><th className="text-right px-3 py-2">Width</th>
            <th className="text-right px-3 py-2">Pwin</th><th className="text-right px-3 py-2">Break-even</th><th className="text-right px-3 py-2">Edge</th>
            <th className="text-right px-3 py-2">EV</th><th className="text-right px-3 py-2">EV adj</th><th className="text-left px-3 py-2">Week VWAP</th><th className="text-right px-3 py-2">IV/RV</th><th className="text-left px-3 py-2">News</th><th className="text-left px-3 py-2">Flow</th>
          </tr>
        </thead>
        <tbody>
          {res.rows.map((r: ScreenerRow, i) => (
            <tr key={i} className={clsx('border-t border-slate-800/70', i === 0 && 'bg-indigo-950/30')}>
              <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{r.symbol} {r.lower_strike}/{r.upper_strike} <span className="text-slate-500 text-xs">{r.expiry} · {r.days}d</span></td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(r.risk)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{r.width}</td>
              <td className="px-3 py-2 text-right tabular-nums">{(100 * r.p_win).toFixed(1)}%</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-400">{(100 * r.need).toFixed(1)}%</td>
              <td className={clsx('px-3 py-2 text-right tabular-nums font-semibold', r.edge > 0 ? 'text-emerald-400' : 'text-rose-400')}>{(100 * r.edge).toFixed(1)}p</td>
              <td className={clsx('px-3 py-2 text-right tabular-nums', r.ev > 0 ? 'text-emerald-300' : 'text-rose-300')}>{fmtMoney(r.ev)}</td>
              <td className={clsx('px-3 py-2 text-right tabular-nums', r.ev_adj > 0 ? 'text-emerald-300' : 'text-rose-300')}>{fmtMoney(r.ev_adj)}</td>
              <td className="px-3 py-2 text-xs whitespace-nowrap">
                {r.week_vwap_trend ? (
                  <>
                    <span className={clsx('font-semibold', r.week_vwap_trend === 'LONG' ? 'text-emerald-300' : r.week_vwap_trend === 'SHORT' ? 'text-rose-300' : 'text-slate-300')}>{r.week_vwap_trend}</span>
                    <span className="text-slate-500"> {r.week_vwap_side?.toLowerCase()} {fmtNum(r.week_vwap, 2)}{r.week_vwap_slope_pct !== null && <> · {r.week_vwap_slope_pct > 0 ? '▲' : r.week_vwap_slope_pct < 0 ? '▼' : '='} {Math.abs(r.week_vwap_slope_pct).toFixed(3)}%</>}{r.week_vwap_sessions ? ` · ${r.week_vwap_sessions}d` : ''}</span>
                    {r.week_vwap_conflict && <div className="text-amber-300">{r.week_vwap_conflict}</div>}
                  </>
                ) : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-3 py-2 text-right text-xs tabular-nums whitespace-nowrap" title={r.iv !== null && r.rv !== null ? `ATM IV ${(100 * r.iv).toFixed(0)}% · RV20 ${(100 * r.rv).toFixed(0)}%` : undefined}>
                {r.iv_rv !== null ? (
                  <>
                    <span className={clsx('font-semibold', r.vol_regime === 'RICH' ? 'text-rose-300' : r.vol_regime === 'CHEAP' ? 'text-emerald-300' : 'text-slate-300')}>{r.iv_rv.toFixed(2)}</span>
                    <span className="text-slate-500"> {r.vol_regime === 'RICH' ? 'rich · sell' : r.vol_regime === 'CHEAP' ? 'cheap · buy' : 'fair'}</span>
                  </>
                ) : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-3 py-2 text-xs">{r.news ?? <span className="text-slate-600">—</span>}{r.news_conflict && <div className="text-amber-300">{r.news_conflict}</div>}</td>
              <td className="px-3 py-2 text-xs">{r.flow ?? <span className="text-slate-600">—</span>}{r.flow_up_pct !== null && <span className="text-slate-500"> {fmtNum(r.flow_up_pct, 0)}%</span>}{r.flow_conflict && <div className="text-amber-300">{r.flow_conflict}</div>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Board() {
  const [params, setParams] = useState<Omit<ScreenerParams, 'side'>>({
    symbols: DEFAULT_SYMBOLS, structure: 'debit', by: 'edge', top: 10, per_symbol: 2, rr_min: 1, rr_max: 3, expiry: nextFriday(),
  });
  const [calls, setCalls] = useState<ScreenerResponse | null>(null);
  const [puts, setPuts] = useState<ScreenerResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true); setError(null);
    try {
      const [c, p] = await Promise.all([
        trading.screener({ ...params, side: 'call' }),
        trading.screener({ ...params, side: 'put' }),
      ]);
      setCalls(c); setPuts(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'screen failed');
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, el: React.ReactNode) => (
    <label className="block text-xs text-slate-400"><span className="uppercase tracking-wider">{label}</span><div className="mt-1">{el}</div></label>
  );
  const input = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-indigo-500 outline-none';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2"><LayoutGrid className="w-4 h-4" /> Auto-Trader · screener</div>
        <h1 className="text-3xl font-bold text-white">The board</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Same ranking the rotation uses: edge is Pwin minus the win rate the price demands. The board prices the odds, not the direction. A name whose options are cheap against its realised moves tops both lists; direction comes from the macro, news and tape vetoes when the market is open.
        </p>
      </div>

      <form onSubmit={run} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 items-end">
        <div className="col-span-2 lg:col-span-3">{field('Symbols (max 12)', <input className={input} value={params.symbols} onChange={(e) => setParams({ ...params, symbols: e.target.value.toUpperCase() })} />)}</div>
        {field('Expiry', <input className={input} value={params.expiry} onChange={(e) => setParams({ ...params, expiry: e.target.value })} placeholder="YYYY-MM-DD or +3" />)}
        {field('Structure', <select className={input} value={params.structure} onChange={(e) => setParams({ ...params, structure: e.target.value as 'debit' | 'credit' })}><option value="debit">debit (buy)</option><option value="credit">credit (sell)</option></select>)}
        {field('Rank by', <select className={input} value={params.by} onChange={(e) => setParams({ ...params, by: e.target.value as ScreenerParams['by'] })}><option value="edge">edge</option><option value="ev">EV $</option><option value="evpct">EV per $</option><option value="prob">probability</option></select>)}
        {field('R:R band', <div className="flex gap-1"><input className={input} type="number" step="0.5" value={params.rr_min} onChange={(e) => setParams({ ...params, rr_min: Number(e.target.value) })} /><input className={input} type="number" step="0.5" value={params.rr_max} onChange={(e) => setParams({ ...params, rr_max: Number(e.target.value) })} /></div>)}
        <button type="submit" disabled={busy} className="h-[38px] inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run both sides
        </button>
      </form>

      {error && <div className="mb-6 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</div>}

      <div className="grid xl:grid-cols-2 gap-6">
        {[['Calls', calls, 'bullish'], ['Puts', puts, 'bearish']].map(([title, res, dir]) => (
          <div key={title as string} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">{title as string} <span className="text-slate-500 text-sm font-normal">· {params.structure} · {dir as string}</span></h2>
              {res && <span className="text-xs text-slate-500">{(res as ScreenerResponse).returned} of {(res as ScreenerResponse).considered} considered</span>}
            </div>
            {busy && !res ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
              : res ? <RowsTable res={res as ScreenerResponse} /> : <div className="p-8 text-center text-slate-500 text-sm">Run the screen to see the board.</div>}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4">Each symbol costs an option-chain fetch. Quotes are the broker&apos;s last; outside market hours they are the previous close.</p>
    </div>
  );
}

export default function BoardPage() {
  return (
    <>
      <Head><title>Screener board — Data AI Systems</title></Head>
    <RequireAuth roles={['admin', 'trader']}>
      <Board />
    </RequireAuth>
    </>
  );
}
