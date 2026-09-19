import Head from 'next/head';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Loader2, Power, Radar, ShieldAlert, Siren, Zap } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { FlattenPreview, FlowRow, StatusResponse, trading } from '@/lib/trading';

function Card({ title, icon: Icon, children, danger }: { title: string; icon: React.ElementType; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={clsx('bg-slate-900 border rounded-2xl p-6', danger ? 'border-rose-900/60' : 'border-slate-800')}>
      <div className="flex items-center gap-2 mb-4"><Icon className={clsx('w-5 h-5', danger ? 'text-rose-400' : 'text-indigo-400')} /><h2 className="font-semibold text-white">{title}</h2></div>
      {children}
    </div>
  );
}

const btn = 'px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50';

function Controls() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flowSyms, setFlowSyms] = useState('MU,NVDA,TSLA,AVGO,SNDK');
  const [flow, setFlow] = useState<FlowRow[] | null>(null);
  const [preview, setPreview] = useState<FlattenPreview | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [underlying, setUnderlying] = useState('');
  const [result, setResult] = useState<FlattenPreview | null>(null);

  const refresh = () => trading.status().then(setStatus).catch((e: Error) => setErr(e.message));
  useEffect(() => { void refresh(); }, []);

  const act = async (name: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(name); setErr(null); setMsg(null);
    try { await fn(); await refresh(); if (done) setMsg(done); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'failed'); }
    finally { setBusy(null); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2"><Zap className="w-4 h-4" /> Auto-Trader · controls</div>
        <h1 className="text-3xl font-bold text-white">Engine controls</h1>
        <p className="text-slate-400 text-sm mt-1">The kill switch stops the engine from deciding. Flatten closes what is held. They are different things, and both ask twice.</p>
      </div>

      {err && <div className="mb-6 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4" /> {err}</div>}
      {msg && <div className="mb-6 bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 rounded-xl px-4 py-3 text-sm">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Kill switch" icon={Power}>
          <p className="text-sm text-slate-400 mb-4">
            {status ? (status.kill_switch_active ? 'ACTIVE: the engine will not open or manage positions algorithmically.' : 'Off: the engine decides normally.') : '…'}
          </p>
          <div className="flex gap-2">
            <button disabled={!!busy || status?.kill_switch_active} onClick={() => confirm('Activate the kill switch? Algorithmic decisions stop; open positions are left as they are.') && act('ks', () => trading.killSwitch('ACTIVATE'), 'Kill switch activated.')} className={clsx(btn, 'bg-rose-700 hover:bg-rose-600 text-white')}>Activate</button>
            <button disabled={!!busy || !status?.kill_switch_active} onClick={() => act('ks', () => trading.killSwitch('DEACTIVATE'), 'Kill switch deactivated.')} className={clsx(btn, 'bg-slate-700 hover:bg-slate-600 text-white')}>Deactivate</button>
          </div>
        </Card>

        <Card title="Scheduler" icon={Zap}>
          <p className="text-sm text-slate-400 mb-4">
            {status ? `${status.scheduler_running ? 'Running' : 'Stopped'} · interval ${status.scheduler_interval_seconds}s · last cycle ${status.last_execution_status ?? '—'}` : '…'}
          </p>
          <div className="flex gap-2">
            <button disabled={!!busy || status?.scheduler_running} onClick={() => act('sch', trading.schedulerStart, 'Scheduler started.')} className={clsx(btn, 'bg-indigo-600 hover:bg-indigo-500 text-white')}>Start</button>
            <button disabled={!!busy || !status?.scheduler_running} onClick={() => act('sch', trading.schedulerStop, 'Scheduler stopped.')} className={clsx(btn, 'bg-slate-700 hover:bg-slate-600 text-white')}>Stop</button>
          </div>
        </Card>

        <Card title="Tape read (VWAP flow)" icon={Radar}>
          <div className="flex gap-2 mb-3">
            <input value={flowSyms} onChange={(e) => setFlowSyms(e.target.value.toUpperCase())} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
            <button disabled={!!busy} onClick={() => act('flow', async () => setFlow((await trading.flow(flowSyms)).rows))} className={clsx(btn, 'bg-indigo-600 hover:bg-indigo-500 text-white')}>{busy === 'flow' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Read'}</button>
          </div>
          {flow && (
            <table className="w-full text-sm">
              <tbody>
                {flow.map((r, i) => (
                  <tr key={i} className="border-t border-slate-800/70">
                    <td className="py-2 text-white font-medium">{String(r.symbol)}</td>
                    <td className={clsx('py-2 text-xs font-semibold', r.label === 'BUY' ? 'text-emerald-400' : r.label === 'SELL' ? 'text-rose-400' : 'text-slate-400')}>{String(r.label ?? '—')}</td>
                    <td className="py-2 text-xs text-slate-400 text-right">{Object.entries(r).filter(([k]) => !['symbol', 'label'].includes(k)).slice(0, 4).map(([k, v]) => `${k} ${typeof v === 'number' ? v.toFixed(2) : String(v)}`).join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xs text-slate-500 mt-3">BUY and SELL need price-vs-VWAP and up-volume share to agree; anything else is MIXED.</p>
        </Card>

        <Card title="Flatten everything" icon={Siren} danger>
          {!isAdmin ? (
            <p className="text-sm text-slate-400 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400" /> Admin role required.</p>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-3">Closes every spread the broker holds as multileg limit orders at the mark. Preview first; execution needs the token the preview returns and the word typed below.</p>
              <div className="flex gap-2 mb-3">
                <input placeholder="one underlying, blank = all" value={underlying} onChange={(e) => setUnderlying(e.target.value.toUpperCase())} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-rose-500" />
                <button disabled={!!busy} onClick={() => act('fp', async () => { setResult(null); setPreview(await trading.flattenPreview(underlying)); })} className={clsx(btn, 'bg-slate-700 hover:bg-slate-600 text-white')}>{busy === 'fp' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Preview'}</button>
              </div>
              {preview && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 mb-3 max-h-56 overflow-auto">
                  <div className="text-slate-400 mb-1">would close {preview.would_close?.length ?? 0} structure(s){preview.pairing_shortfalls?.length ? ` · ${preview.pairing_shortfalls.length} unpaired leg(s) NOT traded` : ''}</div>
                  {preview.would_close?.map((w, i) => <div key={i} className="font-mono">{JSON.stringify(w)}</div>)}
                  {preview.note && <div className="text-amber-300 mt-2">{preview.note}</div>}
                </div>
              )}
              {preview?.plan_token && (
                <div className="flex gap-2">
                  <input placeholder='type LIQUIDATE' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="flex-1 bg-slate-950 border border-rose-900 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none" />
                  <button disabled={!!busy || confirmText !== 'LIQUIDATE'} onClick={() => act('fx', async () => { setResult(await trading.flattenExecute(preview.plan_token!, underlying)); setPreview(null); setConfirmText(''); }, 'Flatten sent. Check positions.')} className={clsx(btn, 'bg-rose-700 hover:bg-rose-600 text-white')}>{busy === 'fx' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute'}</button>
                </div>
              )}
              {result && <pre className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 overflow-auto max-h-56">{JSON.stringify(result, null, 2)}</pre>}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ControlsPage() {
  return (
    <>
      <Head><title>Engine controls — Data AI Systems</title></Head>
    <RequireAuth roles={['admin', 'trader']}>
      <Controls />
    </RequireAuth>
    </>
  );
}
