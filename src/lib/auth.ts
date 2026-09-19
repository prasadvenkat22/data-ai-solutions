/**
 * Auth against the FastAPI backend: /auth/login, /auth/refresh, /auth/me.
 *
 * Tokens live in localStorage and travel as a bearer header. The site is
 * served over HTTPS behind nginx on the same origin as the API, so the
 * browser never sends them anywhere else. `authFetch` retries once after a
 * refresh on 401, and a single in-flight refresh is shared by concurrent
 * callers so a page with five panels does not refresh five times.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const ACCESS_KEY = 'dai_access_token';
const REFRESH_KEY = 'dai_refresh_token';

export interface Me {
  id: number;
  name: string;
  email: string;
  role: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in_minutes: number;
}

const isBrowser = () => typeof window !== 'undefined';

export function getAccessToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null;
}

export function setTokens(t: TokenResponse): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, t.access_token);
  window.localStorage.setItem(REFRESH_KEY, t.refresh_token);
}

export function clearTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

async function detailOf(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === 'string') return body.detail;
    if (body?.detail) return JSON.stringify(body.detail);
  } catch {
    /* not JSON */
  }
  return fallback;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await detailOf(res, `Login failed (${res.status})`));
  const tokens = (await res.json()) as TokenResponse;
  setTokens(tokens);
  return tokens;
}

let refreshing: Promise<boolean> | null = null;

export function refreshTokens(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const rt = getRefreshToken();
    if (!rt) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      setTokens((await res.json()) as TokenResponse);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function authFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 && retry && (await refreshTokens())) {
    return authFetch(path, init, false);
  }
  return res;
}

/** JSON helper that turns a non-2xx into an Error carrying the API's detail. */
export async function authJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(path, init);
  if (!res.ok) throw new Error(await detailOf(res, `API error ${res.status}`));
  return (await res.json()) as T;
}

export async function fetchMe(): Promise<Me | null> {
  if (!getAccessToken()) return null;
  const res = await authFetch('/auth/me');
  if (!res.ok) return null;
  return (await res.json()) as Me;
}

export function logout(): void {
  clearTokens();
}
