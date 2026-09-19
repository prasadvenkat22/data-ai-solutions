
## Data AI Systems — trading desk and AI lab (2026-09-19)

The site is served at https://data-ai-systems.com by the FastAPI stack's nginx
(one origin: `/auth`, `/trading`, `/api`, `/CRUD` are proxied to the API, the
rest to this app). `NEXT_PUBLIC_API_URL` is empty in production on purpose.

- `/login` — email + password against `POST /auth/login`; tokens are kept in
  localStorage and refreshed through `/auth/refresh`.
- `/trading` (roles `admin`, `trader`) — live positions with the exit ladder,
  `/trading/history`, `/trading/board` (screener), `/trading/controls`
  (kill switch, scheduler, tape read, two-step flatten — admin only).
- `/ai` (role `admin`) — ask the trading book (guarded read-only SQL agent on
  Gemini), analyze a CSV/PDF upload, direct prompt.

Deploy on the droplet:

```
tar --exclude=node_modules --exclude=.next --exclude=.git -czf /tmp/ui.tgz -C .. data-ai-solutions
scp /tmp/ui.tgz root@<droplet>:/tmp/ && ssh root@<droplet> 'rm -rf /opt/data-ai-solutions && tar -xzf /tmp/ui.tgz -C /opt && cd /opt/data-ai-solutions && docker compose -f docker-compose.server.yml up -d --build'
```

The container joins the `fastapi_default` network with no published port;
nginx reaches it as `data-ai-web:3000`. Local dev: `API_BACKEND_URL=http://localhost:8000 npm run dev`
and the rewrites in `next.config.js` forward the API paths.
