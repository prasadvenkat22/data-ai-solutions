import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Loader2, RotateCcw, Save, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { SettingsResponse, TradingSetting, trading } from '@/lib/trading';

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

/** Client-side mirror of settings_overrides.validate; the API has the final word. */
function problem(s: TradingSetting, v: string): string | null {
  const t = v.trim();
  if (s.kind === 'bool') return null;
  if (s.kind === 'time') {
    if (t === '' && s.allow_blank) return null;
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
  const dirty = value !== s.effective;
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

  const groups = useMemo(() => {
    const out: Record<string, TradingSetting[]> = {};
    data?.settings.forEach((s) => { (out[s.group] ??= []).push(s); });
    return Object.entries(out);
  }, [data]);

  const changed = data?.settings.filter((s) => draft[s.key] !== undefined && draft[s.key].trim() !== s.effective) ?? [];
  const invalid = changed.some((s) => problem(s, draft[s.key]) !== null);

  const run = async (fn: () => Promise<SettingsResponse>, done: string) => {
    setBusy(true); setErr(null); setMsg(null);
    try { load(await fn()); setMsg(done); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'failed'); }
    finally { setBusy(false); }
  };

  const save = () => {
    const lines = changed.map((s) => `${s.label} (${s.group}): ${s.effective || 'blank'} → ${draft[s.key].trim() || 'blank'}`);
    if (!confirm(`Apply ${changed.length} change(s)?\n\n${lines.join('\n')}\n\nThese apply to OPEN positions from the next cycle (within a minute).`)) return;
    void run(
      () => trading.updateSettings(Object.fromEntries(changed.map((s) => [s.key, draft[s.key].trim()]))),
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
          <span className="text-sm text-slate-400 mr-auto">{changed.length ? `${changed.length} unsaved change(s)` : 'No changes'}</span>
          <button disabled={busy || !changed.length} onClick={() => load(data)} className={clsx(btn, 'bg-slate-700 hover:bg-slate-600 text-white')}>Discard</button>
          <button disabled={busy || !changed.length || invalid} onClick={save} className={clsx(btn, 'bg-indigo-600 hover:bg-indigo-500 text-white')}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
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
