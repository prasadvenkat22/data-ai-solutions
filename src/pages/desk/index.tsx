import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronDown, ChevronRight, Clock, Gauge,
  Loader2, Power, RefreshCw, ShieldCheck, Target, TrendingUp, Zap,
} from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import {
  BrokerPosition, PositionsResponse, StatusResponse, fmtMoney, fmtNum, fmtPct, isExpiringToday, trading,
} from '@/lib/trading';

const REFRESH_MS = 30_000;

function pnlColor(v: number | null | undefined) {
  if (v === null || v === undefined) return 'text-slate-400';
  return v > 0 ? 'text-emerald-400' : v < 0 ? 'text-rose-400' : 'text-slate-300';
}

function Chip({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'red' | 'amber' | 'indigo' }) {
  const tones = {
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    green: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    red: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    indigo: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
  };
  return <span className={clsx('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border', tones[tone])}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, sub, tone }: { icon: React.ElementType; label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
        <Icon className={clsx('w-4 h-4', tone ?? 'text-indigo-400')} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function PositionRow({ p }: { p: BrokerPosition }) {
  const [open, setOpen] = useState(false);
  const width = Math.abs(p.short_strike - p.long_strike);
  const dte0 = isExpiringToday(p.expiry);
  const pnlDollars =
    p.current_value === null || p.current_value === undefined
      ? null
      : (p.credit ? p.entry - p.current_value : p.current_value - p.entry) * p.quantity * 100;
  const intrinsicPct = p.intrinsic !== null && width > 0 ? Math.min(100, Math.max(0, (p.intrinsic / width) * 100)) : null;
  const dragPct = p.drag_now !== null && p.drag_now !== undefined && width > 0 ? (p.drag_now / width) * 100 : null;
  const expiry = `20${p.expiry.slice(0, 2)}-${p.expiry.slice(2, 4)}-${p.expiry.slice(4, 6)}`;

  return (
    <>
      <tr className="border-t border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            <div>
              <div className="font-semibold text-white">
                {p.underlying} <span className="text-slate-400 font-normal">{p.right === 'C' ? 'call' : 'put'}</span>{' '}
                {p.long_strike}/{p.short_strike} <span className="text-slate-400">×{p.quantity}</span>
              </div>
              <div className="flex gap-1.5 mt-1">
                <Chip tone={p.credit ? 'amber' : 'indigo'}>{p.credit ? 'credit' : 'debit'}</Chip>
                <Chip tone={dte0 ? 'red' : 'slate'}>{dte0 ? '0DTE · flatten 15:45' : `expires ${expiry}`}</Chip>
                {p.drag_blocks && <Chip tone="amber"><ShieldCheck className="w-3 h-3" /> drag guard</Chip>}
                {p.stall_armed && <Chip tone="green"><Target className="w-3 h-3" /> stall armed</Chip>}
                {p.past_hold === false && <Chip tone="slate"><Clock className="w-3 h-3" /> hold to {p.hold_until}</Chip>}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{fmtNum(p.entry)}</td>
        <td className="px-4 py-3 text-right text-white tabular-nums font-medium">{fmtNum(p.current_value)}</td>
        <td className={clsx('px-4 py-3 text-right tabular-nums font-semibold', pnlColor(p.return_pct))}>
          <div className="flex items-center justify-end gap-1">
            {p.return_pct !== null && (p.return_pct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />)}
            {fmtPct(p.return_pct)}
          </div>
          <div className={clsx('text-xs font-normal', pnlColor(pnlDollars))}>{fmtMoney(pnlDollars)}</div>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-slate-300">
          {fmtPct(p.peak_pct)}
          {p.minutes_since_peak !== null && <div className="text-xs text-slate-500">{Math.round(p.minutes_since_peak)} min ago</div>}
        </td>
        <td className="px-4 py-3">
          <div className="text-xs text-slate-400 mb-1 flex justify-between">
            <span>intrinsic {fmtNum(p.intrinsic)} / {width}</span>
            <span className={clsx(dragPct !== null && dragPct > 15 ? 'text-amber-300' : 'text-slate-500')}>
              drag {dragPct === null ? '—' : `${dragPct.toFixed(0)}%`}
            </span>
          </div>
          <div className="h-2 w-40 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${intrinsicPct ?? 0}%` }} />
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-300 space-y-0.5">
          {p.stop_pct !== null && (
            <div>stop <span className="text-rose-300">{fmtPct(p.stop_pct, 0)}</span>{p.stop_confirm_minutes ? ` · ${p.stop_confirm_minutes}m` : ''}</div>
          )}
          {p.stall_quiet_minutes !== null && (
            <div>stall {fmtNum(p.stall_giveback_points, 1)}pts · {p.stall_quiet_minutes}m{p.stall_min_gain_pct ? ` · floor +${p.stall_min_gain_pct}%` : ''}</div>
          )}
          {p.ceiling_value !== null && <div>ceiling {fmtNum(p.ceiling_value)}</div>}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-950/60 border-t border-slate-800/60">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                ['Extrinsic (mark − intrinsic)', fmtNum(p.extrinsic)],
                ['Drag ceiling ($ of width)', fmtNum(p.drag_ceiling)],
                ['Drag now', fmtNum(p.drag_now)],
                ['Profit exits blocked by drag', p.drag_blocks ? 'yes' : 'no'],
                ['Stall give-back (pts of return)', fmtNum(p.stall_giveback_points, 1)],
                ['Stall quiet minutes', fmtNum(p.stall_quiet_minutes, 0)],
                ['Stall gain floor', p.stall_min_gain_pct !== null ? `+${p.stall_min_gain_pct}%` : '—'],
                ['Hold window', p.hold_until ?? 'none'],
                ['Stop confirm minutes', fmtNum(p.stop_confirm_minutes, 1)],
                ['Width', String(width)],
                ['Expiry', expiry],
                ['Note', p.note ?? '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-slate-500">{k}</div>
                  <div className="text-slate-200 font-medium">{v}</div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Dashboard() {
  const [positions, setPositions] = useState<PositionsResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([trading.positions(), trading.status()]);
      setPositions(p);
      setStatus(s);
      setError(null);
      setUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [auto, load]);

  const unreal = positions?.total_unrealized_dollars ?? null;
  const dte0Count = positions?.positions.filter((p) => isExpiringToday(p.expiry)).length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2">
            <Activity className="w-4 h-4" /> Auto-Trader · live positions
          </div>
          <h1 className="text-3xl font-bold text-white">Trading desk</h1>
          <p className="text-slate-400 text-sm mt-1">
            Every spread the broker holds, with the exit ladder the engine is applying to it right now.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <>
              <Chip tone={status.kill_switch_active ? 'red' : 'green'}>
                <Power className="w-3 h-3" /> {status.kill_switch_active ? 'KILL SWITCH ON' : 'engine armed'}
              </Chip>
              <Chip tone={status.scheduler_running ? 'green' : 'slate'}>
                <Zap className="w-3 h-3" /> scheduler {status.scheduler_running ? 'running' : 'stopped'}
              </Chip>
            </>
          )}
          <button
            onClick={() => setAuto((a) => !a)}
            className={clsx('text-xs px-3 py-1.5 rounded-lg border', auto ? 'border-indigo-600 text-indigo-300 bg-indigo-950/40' : 'border-slate-700 text-slate-400')}
          >
            auto-refresh {auto ? 'on' : 'off'}
          </button>
          <button onClick={() => void load()} className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Gauge} label="Open spreads" value={positions?.count ?? '—'} sub={`${dte0Count} expiring today`} />
        <StatCard
          icon={TrendingUp}
          label="Unrealized"
          value={<span className={pnlColor(unreal)}>{fmtMoney(unreal)}</span>}
          sub="at the natural mark, not intrinsic"
          tone={pnlColor(unreal)}
        />
        <StatCard
          icon={Target}
          label="Realized, all time"
          value={<span className={pnlColor(status?.total_realized_pnl_dollars)}>{fmtMoney(status?.total_realized_pnl_dollars)}</span>}
          sub={`${status?.closed_trade_count ?? '—'} closed trades`}
        />
        <StatCard
          icon={Clock}
          label="Last engine cycle"
          value={status?.last_execution_status ?? '—'}
          sub={status?.last_cycle_at ? new Date(status.last_cycle_at).toLocaleString() : 'no cycle logged'}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Positions</h2>
          <div className="text-xs text-slate-500">
            managed: {positions?.managed_underlyings.length ? positions.managed_underlyings.join(', ') : 'all'} ·{' '}
            {updated ? `updated ${updated.toLocaleTimeString()}` : ''}
          </div>
        </div>
        {loading && !positions ? (
          <div className="p-10 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : positions && positions.positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3">Structure</th>
                  <th className="text-right px-4 py-3">Entry</th>
                  <th className="text-right px-4 py-3">Mark</th>
                  <th className="text-right px-4 py-3">Return</th>
                  <th className="text-right px-4 py-3">Peak</th>
                  <th className="text-left px-4 py-3">Intrinsic vs width</th>
                  <th className="text-left px-4 py-3">Ladder</th>
                </tr>
              </thead>
              <tbody>
                {positions.positions.map((p) => (
                  <PositionRow key={`${p.underlying}${p.expiry}${p.right}${p.long_strike}${p.short_strike}`} p={p} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">No open spreads at the broker.</div>
        )}
      </div>

      {status?.position.open && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-2">Engine&apos;s own position (QQQ book)</h3>
          <div className="text-sm text-slate-300">
            {status.position.strategy} {status.position.underlying} {status.position.long_strike}/{status.position.short_strike} ×
            {status.position.quantity} · entry {fmtNum(status.position.entry_net_debit)} · now{' '}
            {fmtNum(status.position.estimated_current_value)} ·{' '}
            <span className={pnlColor(status.position.unrealized_pnl_dollars)}>
              {fmtPct(status.position.unrealized_pnl_pct)} ({fmtMoney(status.position.unrealized_pnl_dollars)})
            </span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/desk/history" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">Closed trades</Link>
        <Link href="/desk/board" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">Screener board</Link>
        <Link href="/desk/controls" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">Controls</Link>
        <Link href="/ai" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">Ask the book (AI)</Link>
      </div>
    </div>
  );
}

export default function TradingPage() {
  return (
    <>
      <Head><title>Trading desk — Data AI Systems</title></Head>
    <RequireAuth roles={['admin', 'trader']}>
      <Dashboard />
    </RequireAuth>
    </>
  );
}
