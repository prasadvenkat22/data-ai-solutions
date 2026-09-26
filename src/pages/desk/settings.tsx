import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, CalendarClock, Loader2, RotateCcw, Save, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { ScheduleResponse, SettingsResponse, TradingSetting, trading } from '@/lib/trading';

const btn = 'px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2';
const input =
  'w-28 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 text-right outline-none focus:border-indigo-500 disabled:opacity-60';

const SOURCE_STYLE: Record<TradingSetting['source'], string> = {
  override: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60',
  env: 'bg-slate-800 text-slate-300 border-slate-700',
  default: 'bg-slate-900 text-slate-500 border-slate-800',
};
const SOURCE_LABEL: Record<TradingSetting['source'], string> = {
  override: 'override',
  env: '.env.production',
  default: 'code default',
};

/** Trade-type views (fastapi section 243). A group belongs to the types whose name it matches;
 *  groups that match none (buckets, entries, gates, account) show under "All" only. */
type View = 'all' | '0dte' | 'w3' | 'w7';
const VIEWS: { value: View; label: string }[] = [
  { value: 'all', label: 'All settings' },
  { value: '0dte', label: '0DTE (same day)' },
  { value: 'w3', label: '3-day spreads' },
  { value: 'w7', label: '7-day spreads' },
];
function groupTypes(group: string): View[] {
  if (group.startsWith('0DTE exits') || group.startsWith('QQQ engine exits')) return ['0dte'];
  if (group.startsWith('3-day')) return ['w3'];
  if (group.startsWith('7-day')) return ['w7'];
  if (group.startsWith('Weekly')) return ['w3', 'w7'];   // the shared defaults both types fall back to
  return [];
}
const VIEW_NOTE: Record<View, string> = {
  all: '',
  '0dte': 'Same-day positions, including any weekly on its expiry day. "Force close at" is the end-of-day flatten.',
  w3: 'Spreads bought 2-4 days before expiry. A blank setting uses the shared weekly value shown below it.',
  w7: 'Spreads bought 5+ days before expiry. A blank setting uses the shared weekly value shown below it.',
};

/** Client-side mirror of settings_overrides.validate; the API has the final word. */
/** What is sent: trimmed, and a trailing % dropped so "30%" means 30. */
function clean(s: TradingSetting, v: string): string {
  const t = v.trim();
  return s.kind === 'float' || s.kind === 'int' ? t.replace(/\s*%$/, '') : t;
}

function problem(s: TradingSetting, v: string): string | null {
  const t = clean(s, v);
  if (s.kind === 'bool') return null;
  if (t === '' && s.allow_blank) return null;   // blank = off / follow the shared value
  if (s.kind === 'time') {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? null : 'HH:MM';
  }
  if (t === '' || Number.isNaN(Number(t))) return 'number';
  const n = Number(t);
  if (s.kind === 'int' && !Number.isInteger(n)) return 'whole number';
  if (s.min !== null && n < s.min) return `min ${s.min}`;
  if (s.max !== null && n > s.max) return `max ${s.max}`;
  return null;
}

function Row({ s, value, onChange, onRevert, readOnly }: {
  s: TradingSetting; value: string; onChange: (v: string) => void; onRevert: () => void; readOnly: boolean;
}) {
  const dirty = clean(s, value) !== s.effective;
  const err = dirty ? problem(s, value) : null;
  return (
    <tr className={clsx('border-t border-slate-800/70 align-top', dirty && 'bg-indigo-950/30')}>
      <td className="py-3 pr-4">
        <div className="text-white text-sm font-medium">{s.label}</div>
        <div className="text-[11px] font-mono text-slate-500">{s.key}</div>
        {s.help && <div className="text-xs text-slate-400 mt-1 max-w-md">{s.help}</div>}
      </td>
      <td className="py-3 pr-2 whitespace-nowrap">
        {s.kind === 'bool' ? (
          <button
            type="button"
            disabled={readOnly}
            onClick={() => onChange(value === 'true' ? 'false' : 'true')}
            className={clsx('w-16 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-60',
              value === 'true' ? 'bg-emerald-900/50 border-emerald-700 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-400')}
          >
            {value === 'true' ? 'ON' : 'OFF'}
          </button>
        ) : (
          <input
            disabled={readOnly}
            value={value}
            inputMode={s.kind === 'time' ? 'text' : 'decimal'}
            placeholder={s.kind === 'time' ? (s.allow_blank ? 'blank = off' : 'HH:MM') : ''}
            onChange={(e) => onChange(e.target.value)}
            className={clsx(input, err && 'border-rose-600 focus:border-rose-500')}
          />
        )}
        <span className="text-xs text-slate-500 ml-2">{s.unit}</span>
        {err && <div className="text-[11px] text-rose-400 mt-1">{err}</div>}
      </td>
      <td className="py-3 pr-2 text-xs text-slate-500 whitespace-nowrap">
        <span className={clsx('px-2 py-0.5 rounded border text-[11px]', SOURCE_STYLE[s.source])}>{SOURCE_LABEL[s.source]}</span>
        <div className="mt-1">env {s.env_value ?? '—'} · default {s.default === '' ? 'blank' : s.default}</div>
        {(s.min !== null || s.max !== null) && <div>range {s.min ?? '…'} to {s.max ?? '…'}</div>}
      </td>
      <td className="py-3 text-right">
        {!readOnly && s.override !== null && (
          <button onClick={onRevert} title="Remove the override; the .env.production value comes back"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> revert
          </button>
        )}
      </td>
    </tr>
  );
}

function Settings() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = (r: SettingsResponse) => {
    setData(r);
    setDraft(Object.fromEntries(r.settings.map((s) => [s.key, s.effective])));
  };
  useEffect(() => { trading.settings().then(load).catch((e: Error) => setErr(e.message)); }, []);

  const [view, setView] = useState<View>('all');
  const groups = useMemo(() => {
    const out: Record<string, TradingSetting[]> = {};
    data?.settings.forEach((s) => { (out[s.group] ??= []).push(s); });
    const all = Object.entries(out);
    if (view === 'all') return all;
    // The type's own group first, then the shared group it falls back to.
    const mine = all.filter(([g]) => groupTypes(g).includes(view));
    return [...mine.filter(([g]) => groupTypes(g).length === 1), ...mine.filter(([g]) => groupTypes(g).length > 1)];
  }, [data, view]);

  const changed = data?.settings.filter((s) => draft[s.key] !== undefined && clean(s, draft[s.key]) !== s.effective) ?? [];
  // Every pending change, in ANY group -- the Trade type view can hide the row that is holding Save back.
  const broken = changed.filter((s) => problem(s, draft[s.key]) !== null);
  const invalid = broken.length > 0;
  const drop = (key: string) => setDraft((d) => { const n = { ...d }; delete n[key]; return n; });

  const run = async (fn: () => Promise<SettingsResponse>, done: string) => {
    setBusy(true); setErr(null); setMsg(null);
    try { load(await fn()); setMsg(done); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'failed'); }
    finally { setBusy(false); }
  };

  const save = () => {
    const lines = changed.map((s) => `${s.label} (${s.group}): ${s.effective || 'blank'} → ${clean(s, draft[s.key]) || 'blank'}`);
    if (!confirm(`Apply ${changed.length} change(s)?\n\n${lines.join('\n')}\n\nThese apply to OPEN positions from the next cycle (within a minute).`)) return;
    void run(
      () => trading.updateSettings(Object.fromEntries(changed.map((s) => [s.key, clean(s, draft[s.key])]))),
      `Saved ${changed.length} setting(s). The next cron cycle trades on them.`,
    );
  };

  const revert = (s: TradingSetting) =>
    confirm(`Remove the override on ${s.label}? The .env.production value (${s.env_value ?? `default ${s.default}`}) comes back next cycle.`) &&
    void run(() => trading.updateSettings({}, [s.key]), `${s.label}: override removed.`);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2"><SlidersHorizontal className="w-4 h-4" /> Auto-Trader · settings</div>
        <h1 className="text-3xl font-bold text-white">Engine settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Stop loss, stall, give-back, budgets. Saving writes an override that beats .env.production and is picked up by the
          next cron cycle, no restart. It applies to positions already open. The rule columns on Positions update after the next app restart.
        </p>
      </div>

      {!isAdmin && (
        <div className="mb-6 flex items-center gap-2 bg-amber-950/30 border border-amber-800/50 text-amber-200 rounded-xl px-4 py-3 text-sm">
          <ShieldAlert className="w-4 h-4" /> Read-only: only a trading admin can change these.
        </div>
      )}
      {err && <div className="mb-6 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4" /> {err}</div>}
      {msg && <div className="mb-6 bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 rounded-xl px-4 py-3 text-sm">{msg}</div>}
      {data?.problems.map((p, i) => (
        <div key={i} className="mb-2 text-xs text-amber-300">overrides file: {p}</div>
      ))}

      <SchedulePanel />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="trade-type" className="text-sm text-slate-300">Trade type</label>
        <select
          id="trade-type"
          value={view}
          onChange={(e) => setView(e.target.value as View)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
        >
          {VIEWS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
        {VIEW_NOTE[view] && <span className="text-xs text-slate-500">{VIEW_NOTE[view]}</span>}
      </div>

      {!data ? (
        <div className="text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="space-y-6">
          {groups.map(([group, rows]) => (
            <div key={group} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-2">{group}</h2>
              <table className="w-full">
                <tbody>
                  {rows.map((s) => (
                    <Row key={s.key} s={s} readOnly={!isAdmin || busy} value={draft[s.key] ?? s.effective}
                      onChange={(v) => setDraft((d) => ({ ...d, [s.key]: v }))} onRevert={() => revert(s)} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {isAdmin && data && (
        <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-3 bg-slate-900/95 border border-slate-800 rounded-2xl px-4 py-3">
          <div className="text-sm text-slate-400 mr-auto">
            {changed.length ? `${changed.length} unsaved change(s)` : 'No changes'}
            {changed.length > 0 && (
              <div className="text-xs text-slate-500 mt-0.5">
                {changed.map((c) => `${c.label} (${c.group.split(' (')[0]})`).join(' · ')}
              </div>
            )}
            {broken.map((b) => (
              <div key={b.key} className="text-xs text-rose-400 mt-0.5">
                Can&apos;t save — {b.label} ({b.group.split(' (')[0]}): &ldquo;{draft[b.key]}&rdquo; is not valid ({problem(b, draft[b.key])}).{' '}
                <button type="button" onClick={() => drop(b.key)} className="underline hover:text-rose-300">drop this change</button>
              </div>
            ))}
          </div>
          <button disabled={busy || !changed.length} onClick={() => load(data)} className={clsx(btn, 'bg-slate-700 hover:bg-slate-600 text-white')}>Discard</button>
          <button disabled={busy || !changed.length || invalid} onClick={save} className={clsx(btn, 'bg-indigo-600 hover:bg-indigo-500 text-white')}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      )}
    </div>
  );
}

/** Read-only: when the single-stock books look for entries (section 240). The on/off
 *  switch and budget for each book are in "Trade buckets" below. */
function SchedulePanel() {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { trading.schedule().then(setData).catch((e: Error) => setErr(e.message)); }, []);
  const when = (j: ScheduleResponse['jobs'][number]) =>
    j.every_minutes && j.times_et.length > 2
      ? `every ${j.every_minutes} min, ${j.times_et[0]}–${j.times_et[j.times_et.length - 1]} ET`
      : `${j.times_et.join(', ')} ET`;
  return (
    <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="font-semibold text-white mb-1 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-indigo-300" /> Entry schedule</h2>
      <p className="text-xs text-slate-500 mb-3">
        From the server&apos;s cron. Read-only. A run only places orders when its bucket switch below is on, within its budget and the buying power.
      </p>
      {err && <div className="text-sm text-rose-300">{err}</div>}
      {!data && !err && <div className="text-slate-400 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>}
      {data && data.note && <div className="mb-2 text-xs text-amber-300">{data.note}</div>}
      {data && data.jobs.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left py-2">Book</th>
              <th className="text-left py-2">Days</th>
              <th className="text-left py-2">When</th>
              <th className="text-left py-2">Expiry</th>
              <th className="text-right py-2">Max trades</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs.map((j, i) => (
              <tr key={i} className="border-t border-slate-800 align-top" title={j.cron + (j.symbols ? ` · ${j.symbols.join(', ')}` : '')}>
                <td className="py-2 text-white">{j.label}</td>
                <td className="py-2 text-slate-300">{j.days.join(' ')}</td>
                <td className="py-2 text-slate-300 tabular-nums">{when(j)}</td>
                <td className="py-2 text-slate-300">{j.expiry}</td>
                <td className="py-2 text-right text-slate-300 tabular-nums">{j.max_trades ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data?.snapshot_at && (
        <div className="mt-2 text-xs text-slate-600">cron read {new Date(data.snapshot_at).toLocaleString()}</div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Head><title>Engine settings — Data AI Systems</title></Head>
      <RequireAuth roles={['admin', 'trader']}>
        <Settings />
      </RequireAuth>
    </>
  );
}
