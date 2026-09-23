import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CalendarClock, Landmark, Loader2 } from 'lucide-react';
import { MacroResponse, trading } from '@/lib/trading';

/**
 * The engine's macro risk gates at a glance: 10Y / VIX / crude against the
 * session open and the thresholds that force risk-off, the rotation's QQQ
 * macro verdict, and today's scheduled events and data releases. Risk-off
 * blocks new engine entries and call-debit rotation picks; it does not
 * change how open positions are managed.
 */
export default function MacroPanel() {
  const [m, setM] = useState<MacroResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = () => trading.macro().then((r) => { setM(r); setErr(null); }).catch((e: Error) => setErr(e.message));
    void load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const r = m?.readings;
  const verdictTone = (v?: string | null) =>
    !v ? 'text-slate-400' : /BEAR|BAD/.test(v) ? 'text-rose-300' : /BULL|GOOD/.test(v) ? 'text-emerald-300' : 'text-slate-300';

  return (
    <div className={clsx('mb-6 bg-slate-900 border rounded-2xl p-5', m?.risk_off ? 'border-rose-900/70' : 'border-slate-800')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Landmark className={clsx('w-5 h-5', m?.risk_off ? 'text-rose-400' : 'text-indigo-400')} />
          <h2 className="font-semibold text-white">Macro</h2>
          {m && (
            <span className={clsx('text-xs px-2 py-0.5 rounded-full border',
              m.risk_off ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60')}>
              {m.risk_off ? 'RISK-OFF: no new engine entries, no call debits' : 'risk gates clear'}
            </span>
          )}
        </div>
        {!m && !err && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
      </div>
      {err && <div className="text-sm text-rose-300">{err}</div>}
      {m && (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wider">Markets vs open</div>
            <div className="text-slate-200">10Y {r?.tnx ? `${r.tnx.level.toFixed(3)}% (${r.tnx.change_bps >= 0 ? '+' : ''}${r.tnx.change_bps.toFixed(1)}bp)` : '—'}</div>
            <div className="text-slate-200">VIX {r?.vix ? `${r.vix.level.toFixed(2)} (${r.vix.change_pct >= 0 ? '+' : ''}${r.vix.change_pct.toFixed(1)}%)` : '—'}</div>
            <div className="text-slate-200">Crude {r?.crude ? `${r.crude.level.toFixed(2)} (${r.crude.change_pct >= 0 ? '+' : ''}${r.crude.change_pct.toFixed(2)}%)` : '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wider">Risk gates</div>
            {m.gates.map((g) => (
              <div key={g.name} className={clsx(g.tripped ? 'text-rose-300' : 'text-slate-300')}>
                {g.tripped ? '●' : '○'} {g.name}: {g.value} <span className="text-slate-500">(trips {g.limit})</span>
              </div>
            ))}
            <div className="pt-1 text-slate-400">
              Rotation macro: <span className={verdictTone(m.rotation?.verdict)}>{m.rotation?.verdict ?? '—'}</span>
              {m.rotation?.confidence != null && <span className="text-slate-500"> {m.rotation.confidence.toFixed(2)}</span>}
              {' · '}Engine: <span className={verdictTone(m.engine.sentiment)}>{m.engine.sentiment ?? '—'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> Today</div>
            {m.calendar.note && <div className="text-amber-300">{m.calendar.note}</div>}
            {m.calendar.releases.length === 0 && !m.calendar.note && <div className="text-slate-500">No scheduled releases listed.</div>}
            {m.calendar.releases.map((x) => (
              <div key={x.time + x.name} className="text-slate-200">
                <span className="text-slate-400">{x.time} ET</span> {x.name}
                {x.note && <div className="text-xs text-slate-500">{x.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
