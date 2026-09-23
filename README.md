
## Data AI Systems — trading desk and AI lab (2026-09-19)

The site is served at https://dataaisys.com by the FastAPI stack's nginx
(one origin: `/auth`, `/desk`, `/api`, `/CRUD` are proxied to the API, the
rest to this app). `NEXT_PUBLIC_API_URL` is empty in production on purpose.

- Two sessions on the same accounts API, signed in and out separately
  (`createSession` in `src/lib/auth.ts`; `useAuth` is the desk's, `useSiteAuth`
  the site's). Signing out of one leaves the other alone; what either may do
  is still the account's role, enforced by the API.
- `/login` — **Trading sign in**, straight to the desk. Email + password against
  `POST /auth/login`; tokens in localStorage (`dai_*`), refreshed through
  `/auth/refresh`. Trading sign out clears them.
- `/signin`, `/signup`, `/verify-email` — the general site's **Sign in / Sign up /
  Sign out** (tokens `dai_site_*`). Sign-up (`POST /auth/signup`) makes a role
  `user` account that works once the mailed link is opened; it cannot reach the
  desk. `?next=` only accepts same-site paths.
- `/forgot-password` — emails a reset link (`POST /auth/forgot-password`; the
  API answers the same whether or not the address has an account).
  `/reset-password?token=…` is the page that link opens; the API builds the
  link to land here (`PASSWORD_RESET_PAGE`, default `/reset-password`).
- `/account` (any signed-in user) — change your own password
  (`POST /auth/change-password`, current password required). Reached from the
  email in the navbar.
- `/users` (role `admin`) — also has a per-user Reset password button
  (`POST /api/users/{id}/reset-password`) that issues a temporary password
  shown once, for when the emailed link cannot work.
- `/desk` (roles `admin`, `trader`) — a Macro card (10Y / VIX / crude vs the open,
  the risk-off gates, the rotation's macro verdict, today's events and data releases;
  `GET /trading/macro`), then live positions with the exit ladder,
  `/desk/history`, `/desk/board` (screener: EV/edge ranking plus, per row, the
  week-anchored VWAP lean LONG/SHORT/MIXED and the IV/RV regime rich/fair/cheap,
  both shown and not ranked on), `/desk/controls`
  (kill switch, scheduler, tape read, two-step flatten — admin only),
  `/desk/settings` (stop loss, stall, give-back, budgets: shows default,
  `.env.production` and override per knob; saving is admin only and the next
  cron cycle trades on it, see `commands.txt` in the API repo).
- Chat widget (every page) — **signed-in accounts only** (site or desk
  session); anonymous visitors see a Sign up / Sign in prompt and no AI.
  `POST /api/chat/ask`: "latest news on MU" is answered from the stored
  RSS/Polygon headlines with sources, anything else by the model with no access
  to trading data. File uploads show for desk admins only. The trading chat is
  `/ai`. The header says who the chat is signed in as; a 401/403 shows "Sign in
  required" and drops back to the sign-up prompt, and any other failure shows
  the API's own message ("busy, try again") rather than a generic error.
- `/ai` — the trading chat. Roles `admin` and `trader`: ask the trading book
  (guarded read-only SQL agent on Gemini). Admin only: analyze a CSV/PDF upload,
  direct prompt.

Deploy on the droplet:

```
tar --exclude=node_modules --exclude=.next --exclude=.git -czf /tmp/ui.tgz -C .. data-ai-solutions
scp /tmp/ui.tgz root@<droplet>:/tmp/ && ssh root@<droplet> 'rm -rf /opt/data-ai-solutions && tar -xzf /tmp/ui.tgz -C /opt && cd /opt/data-ai-solutions && docker compose -f docker-compose.server.yml up -d --build'
```

The container joins the `fastapi_default` network with no published port;
nginx reaches it as `data-ai-web:3000`. Local dev: `API_BACKEND_URL=http://localhost:8000 npm run dev`
and the rewrites in `next.config.js` forward the API paths.
