/** Typed client for the FastAPI trading and GenAI routes. All calls carry the bearer token. */
import { authFetch, authJson } from './auth';

export interface BrokerPosition {
  underlying: string;
  right: 'C' | 'P' | string;
  long_strike: number;
  short_strike: number;
  quantity: number;
  expiry: string; // YYMMDD
  credit: boolean;
  entry: number;
  current_value: number | null;
  intrinsic: number | null;
  extrinsic: number | null;
  return_pct: number | null;
  peak_pct: number | null;
  minutes_since_peak: number | null;
  ceiling_value: number | null;
  stop_pct: number | null;
  stop_confirm_minutes: number | null;
  stall_giveback_points: number | null;
  stall_giveback_pct?: number | null;
  stall_quiet_minutes: number | null;
  stall_armed: boolean | null;
  stall_min_gain_pct: number | null;
  drag_ceiling: number | null;
  drag_now: number | null;
  drag_blocks: boolean | null;
  hold_until?: string | null;
  past_hold?: boolean | null;
  note?: string | null;
}

export interface PositionsResponse {
  positions: BrokerPosition[];
  count: number;
  managed_underlyings: string[];
  total_unrealized_dollars: number | null;
}

export interface OpenPosition {
  open: boolean;
  strategy: string | null;
  underlying: string | null;
  quantity: number | null;
  long_strike: number | null;
  short_strike: number | null;
  entry_net_debit: number | null;
  current_spot: number | null;
  estimated_current_value: number | null;
  unrealized_pnl_pct: number | null;
  unrealized_pnl_dollars: number | null;
  opened_at: string | null;
}

export interface StatusResponse {
  kill_switch_active: boolean;
  scheduler_running: boolean;
  scheduler_interval_seconds: number;
  position: OpenPosition;
  total_realized_pnl_dollars: number;
  closed_trade_count: number;
  last_execution_status: string | null;
  last_cycle_at: string | null;
}

export interface TradeHistoryEntry {
  strategy: string;
  underlying: string;
  quantity: number;
  long_strike: number;
  short_strike: number;
  entry_net_debit: number;
  exit_net_value: number;
  realized_pnl_dollars: number;
  realized_pnl_pct: number;
  close_reason: string;
  opened_at: string | null;
  closed_at: string | null;
  playbook?: string | null;
}

export interface HistoryResponse {
  total_realized_pnl_dollars: number;
  trade_count: number;
  trades: TradeHistoryEntry[];
}

export interface PlaybookStat {
  playbook: string;
  trades: number;
  wins: number;
  losses: number;
  win_rate_pct: number;
  total_pnl_dollars: number;
  avg_pnl_pct: number;
  best_pct: number;
  worst_pct: number;
  close_reasons: Record<string, number>;
  active: boolean;
  window?: string | null;
  placement?: string | null;
}

export interface ScreenerRow {
  symbol: string;
  lower_strike: number;
  upper_strike: number;
  structure: string;
  direction: string;
  credit: number | null;
  width: number;
  expiry: string;
  days: number;
  itm_atr: number;
  risk: number;
  reward: number;
  rr: number;
  // The chain's deltas: the leg you own, the leg you sold, and the net
  // (the market's odds of finishing between the strikes). For comparison
  // with Pwin; not used in the ranking.
  delta_long: number | null;
  delta_short: number | null;
  delta_net: number | null;
  p_imp: number;
  p_hist: number;
  p_mc: number;
  p_win: number;
  need: number;
  edge: number;
  ev: number;
  ev_adj: number;
  ev_raw: number;
  news: string | null;
  news_conflict: string | null;
  flow: string | null;
  flow_up_pct: number | null;
  flow_conflict: string | null;
  // The week's VWAP (anchored to Monday's open), one read per underlying:
  // which way the week's volume leans, so the board says what to long or short.
  week_vwap: number | null;
  week_vwap_side: 'ABOVE' | 'AT' | 'BELOW' | null;
  week_vwap_slope_pct: number | null;
  week_vwap_sessions: number | null;
  week_vwap_trend: 'LONG' | 'SHORT' | 'MIXED' | null;
  week_vwap_conflict: string | null;
  // Volatility regime per underlying: ATM implied vol of the screened expiry
  // over 20-day realised. RICH (>= 1.2) favours selling spreads, CHEAP (<= 0.8)
  // favours buying them; the shadow books are scored by this ratio.
  iv: number | null;
  rv: number | null;
  iv_rv: number | null;
  vol_regime: 'RICH' | 'FAIR' | 'CHEAP' | null;
}

export interface ScreenerResponse {
  side: string;
  structure: string;
  direction: string;
  sort: string;
  sort_label: string;
  considered: number;
  returned: number;
  underlyings: string[];
  warnings: string[];
  rows: ScreenerRow[];
  note: string;
}

export interface FlowRow {
  symbol: string;
  label?: string;
  vwap?: number | null;
  last?: number | null;
  up_pct?: number | null;
  [key: string]: unknown;
}

export interface FlattenPreview {
  preview: boolean;
  would_close: Array<Record<string, unknown>>;
  pairing_shortfalls?: Array<Record<string, unknown>>;
  plan_token?: string;
  to_execute?: string;
  note?: string;
  error?: string;
  why?: string;
  current_token?: string;
  results?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface ScreenerParams {
  symbols: string;
  side: 'call' | 'put';
  structure: 'debit' | 'credit';
  by: 'edge' | 'ev' | 'evpct' | 'prob';
  top: number;
  per_symbol: number;
  rr_min: number;
  rr_max: number;
  expiry: string;
}

// Tunable engine knobs (trading_engine/settings_overrides.py). `effective` is
// what the next cron cycle trades on; `source` says which layer supplied it.
export interface TradingSetting {
  key: string;
  label: string;
  group: string;
  kind: 'float' | 'int' | 'bool' | 'time';
  default: string;
  help: string;
  unit: string;
  min: number | null;
  max: number | null;
  allow_blank: boolean;
  env_value: string | null;
  override: string | null;
  effective: string;
  source: 'override' | 'env' | 'default';
}

export interface SettingsResponse {
  path: string;
  settings: TradingSetting[];
  problems: string[];
}

const qs = (params: object) =>
  Object.entries(params as Record<string, string | number | boolean | undefined>)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

export const trading = {
  positions: () => authJson<PositionsResponse>('/trading/positions'),
  status: () => authJson<StatusResponse>('/trading/status'),
  history: () => authJson<HistoryResponse>('/trading/history'),
  playbooks: () => authJson<{ stats: PlaybookStat[]; unattributed_trades: number }>('/trading/playbook-performance'),
  screener: (p: ScreenerParams) => authJson<ScreenerResponse>(`/trading/screener/verticals?${qs(p)}`),
  flow: (symbols: string) =>
    authJson<{ day: string; interval: string; returned: number; rows: FlowRow[]; note: string }>(
      `/trading/screener/flow?${qs({ symbols })}`
    ),
  killSwitch: (action: 'ACTIVATE' | 'DEACTIVATE') =>
    authJson<{ kill_switch_active: boolean }>(`/trading/kill-switch/toggle?action=${action}`, { method: 'POST' }),
  settings: () => authJson<SettingsResponse>('/trading/settings'),
  updateSettings: (values: Record<string, string>, unset: string[] = []) =>
    authJson<SettingsResponse>('/trading/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values, unset }),
    }),
  schedulerStart: () => authJson<{ scheduler_running: boolean; interval_seconds: number }>('/trading/scheduler/start', { method: 'POST' }),
  schedulerStop: () => authJson<{ scheduler_running: boolean; interval_seconds: number }>('/trading/scheduler/stop', { method: 'POST' }),
  flattenPreview: (underlying = '') =>
    authJson<FlattenPreview>(`/trading/flatten?${qs({ confirm: 'LIQUIDATE', preview: true, underlying })}`, { method: 'POST' }),
  flattenExecute: (planToken: string, underlying = '') =>
    authJson<FlattenPreview>(
      `/trading/flatten?${qs({ confirm: 'LIQUIDATE', preview: false, plan_token: planToken, underlying })}`,
      { method: 'POST' }
    ),
};

export interface AgentAnswer {
  final_answer: string;
  csv_answer?: string | null;
  pdf_answer?: string | null;
  db_answer?: string | null;
  db_sql?: string | null;
  agents_used: string[];
}

export const genai = {
  ask: (query: string) =>
    authJson<AgentAnswer>('/api/genai/agent/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),
  upload: async (files: File[], query: string) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    fd.append('query', query);
    const res = await authFetch('/api/genai/agent/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`Upload agent failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as AgentAnswer;
  },
  llm: (prompt: string, max_tokens = 800) =>
    authJson<{ content: string; metadata: Record<string, unknown> }>('/api/genai/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, llm_provider: 'gemini', llm_model: 'gemini-3.1-flash-lite', max_tokens }),
    }),
};

/** YYMMDD -> Date (local), null if malformed. */
export function expiryDate(yymmdd: string): Date | null {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  return new Date(2000 + Number(yymmdd.slice(0, 2)), Number(yymmdd.slice(2, 4)) - 1, Number(yymmdd.slice(4, 6)));
}

export function isExpiringToday(yymmdd: string): boolean {
  const d = expiryDate(yymmdd);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export const fmtMoney = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined || Number.isNaN(v)
    ? '—'
    : `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const fmtPct = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(digits)}%`;

export const fmtNum = (v: number | null | undefined, digits = 2) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(digits);
