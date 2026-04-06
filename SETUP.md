# DataAI Solutions — Setup & Deployment Guide

Complete instructions for setting up this project from scratch.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | Comes with Node |
| Git | any | https://git-scm.com |
| Docker | 24+ | https://docs.docker.com/get-docker |
| Docker Compose | v2+ | Included with Docker Desktop |

---

## 1. Clone the Repository

```bash
git clone https://github.com/prasadvenkat22/data-ai-solutions.git
cd data-ai-solutions
```

---

## 2. Environment Variables

Copy the example env file and set your API URL:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://142.93.177.153
```

> Change the URL to point to your FastAPI backend if it moves.

---

## 3. Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
```

Site runs at **http://localhost:3000**

---

## 4. Production Build (Local Test)

```bash
npm run build
npm start
```

Site runs at **http://localhost:3000**

---

## 5. Deploy to Digital Ocean (Docker)

### One-Time Server Setup

SSH into your droplet:
```bash
ssh root@142.93.177.153
```

Install Docker:
```bash
curl -fsSL https://get.docker.com | sh
apt-get install -y git
```

Clone the repo:
```bash
cd /opt
git clone https://github.com/prasadvenkat22/data-ai-solutions.git
cd data-ai-solutions
```

Start the app:
```bash
docker compose up -d --build
```

Site runs at **http://142.93.177.153:3000**

---

## 6. Redeploy After Code Changes

From your local machine (SSH key required):

```bash
ssh root@142.93.177.153 "cd /opt/data-ai-solutions && git pull && docker compose up -d --build"
```

---

## 7. Domain & SSL Setup (HTTPS)

This project uses domain **dataiqsystems.com** with free Let's Encrypt SSL.

### 7.1 Buy a Domain
Purchase from Namecheap (~$12/yr). Skip any SSL upsells — SSL is free via Let's Encrypt.

### 7.2 Point DNS to Server
In Namecheap → Domain List → Manage → Advanced DNS, add:

| Type | Host | Value |
|------|------|-------|
| A Record | `@` | `142.93.177.153` |
| A Record | `www` | `142.93.177.153` |

Wait 5–30 minutes for DNS to propagate. Verify with:
```bash
nslookup dataiqsystems.com 8.8.8.8
```

### 7.3 Architecture Note
This server runs an existing Nginx Docker container (from the FastAPI stack at `/opt/fastapi`)
that already handles port 80. The Next.js app runs as a separate Docker container on port 3000.

**Key setup steps performed:**

**Step 1 — Connect Next.js container to FastAPI Docker network:**
```bash
docker network connect fastapi_default data-ai-solutions-web-1
```
This gives the Nginx container access to the Next.js app.
Next.js container IP on fastapi_default network: `172.18.0.7`

**Step 2 — Add volumes to Nginx in `/opt/fastapi/docker-compose.yml`:**
```yaml
nginx:
  volumes:
    - ./app/nginx/conf.d:/etc/nginx/conf.d
    - /var/www/certbot:/var/www/certbot    # for SSL challenge
    - /etc/letsencrypt:/etc/letsencrypt    # for SSL certs
  ports:
    - 80:80
    - 443:443                              # added for HTTPS
```

**Step 3 — Create Nginx config for the domain:**

File: `/opt/fastapi/app/nginx/conf.d/dataiqsystems.conf`
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name dataiqsystems.com www.dataiqsystems.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    server_name dataiqsystems.com www.dataiqsystems.com;

    ssl_certificate /etc/letsencrypt/live/dataiqsystems.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dataiqsystems.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Allow up to 10MB uploads (needed for AI file uploads — PDF/CSV)
    client_max_body_size 10m;

    # Increase timeouts for AI processing (LLM calls can take 30+ seconds)
    proxy_read_timeout 120s;
    proxy_connect_timeout 10s;

    location / {
        proxy_pass http://172.18.0.7:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 4 — Recreate Nginx container with new volumes:**
```bash
docker stop nginx && docker rm nginx
cd /opt/fastapi && docker compose up -d nginx
```

**Step 5 — Get free SSL certificate:**
```bash
apt-get install -y certbot
certbot certonly --webroot -w /var/www/certbot \
  -d dataiqsystems.com -d www.dataiqsystems.com \
  --non-interactive --agree-tos \
  --email venkatangirala@gmail.com
```

**Step 6 — Recreate Nginx again with SSL config active:**
```bash
docker stop nginx && docker rm nginx
cd /opt/fastapi && docker compose up -d nginx
```

### 7.4 SSL Auto-Renewal
Certbot installs a cron job automatically. To test renewal manually:
```bash
certbot renew --dry-run
```

---

## 8. Troubleshooting

### Site not loading after redeploy
```bash
# Check container is running
docker ps | grep data-ai-solutions

# View logs
docker logs data-ai-solutions-web-1 --tail 50

# Restart container
cd /opt/data-ai-solutions && docker compose restart
```

### Next.js container IP changed after restart
If the container was recreated, its IP on the `fastapi_default` network may change.
Check and update the Nginx config:
```bash
# Get current IP
docker inspect data-ai-solutions-web-1 \
  --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'

# If IP changed, update /opt/fastapi/app/nginx/conf.d/dataiqsystems.conf
# Change proxy_pass http://OLD_IP:3000 to proxy_pass http://NEW_IP:3000
# Then reload nginx
docker exec nginx nginx -s reload
```

### Re-connect Next.js container to FastAPI network (after full rebuild)
```bash
docker network connect fastapi_default data-ai-solutions-web-1
```

### Nginx not starting — port 80 already in use
```bash
# Find what's using port 80
ss -tlnp | grep ':80'

# If it's another Docker container, stop it first
docker stop <container_name>
```

### SSL certificate expired or missing
```bash
certbot renew
docker exec nginx nginx -s reload
```

### Check Nginx config is valid
```bash
docker exec nginx nginx -t
```

### View Nginx logs
```bash
docker logs nginx --tail 50
```

### DNS not propagated yet
```bash
nslookup dataiqsystems.com 8.8.8.8
# Should return 142.93.177.153
```

---

## 9. GitHub Setup (First Time)

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Create repo on github.com/new, then:
git remote add origin https://YOUR_TOKEN@github.com/prasadvenkat22/data-ai-solutions.git
git push -u origin master
```

---

## 10. Project Structure

```
data-ai-solutions/
├── src/
│   ├── components/
│   │   ├── Layout.tsx        # Footer + navbar wrapper
│   │   ├── Navbar.tsx        # Top navigation with dropdowns
│   │   └── AIChatWidget.tsx  # Bottom-right AI chat with file upload
│   ├── lib/
│   │   └── api.ts            # FastAPI client functions
│   ├── pages/
│   │   ├── index.tsx         # Home page with service cards
│   │   ├── services.tsx      # Services listing + add service form
│   │   ├── customers.tsx     # Customer CRUD (list, add, edit, delete)
│   │   ├── users.tsx         # User management + registration
│   │   └── registrations.tsx # Demo booking with calendar picker
│   ├── styles/
│   │   └── globals.css       # Global styles + dark datepicker theme
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Docker Compose config (port 3000)
├── .env.local.example        # Environment variable template
└── SETUP.md                  # This file
```

---

## 11. Server Architecture

```
Internet
   │
   ▼
Nginx (Docker, port 80/443)          ← /opt/fastapi/docker-compose.yml
   ├── dataiqsystems.com  ──────────► Next.js (Docker, port 3000)
   │                                   /opt/data-ai-solutions/
   ├── /CRUD/*            ──────────► FastAPI (Docker, port 8000)
   ├── /api/*             ──────────► FastAPI (Docker, port 8000)
   └── /                  ──────────► Streamlit (Docker, port 8501)

PostgreSQL (Docker, port 5432)
MongoDB    (Docker, port 27017)
```

---

## 12. FastAPI Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/CRUD/register/` | POST | Register new user |
| `/CRUD/users/` | GET | List all users |
| `/CRUD/customers/` | GET/POST | List / create customers |
| `/CRUD/customers/{id}` | PUT/DELETE | Update / delete customer |
| `/CRUD/services/` | GET/POST | Services catalog |
| `/CRUD/registrations/` | GET/POST | Demo registrations |
| `/api/genai/llm` | POST | AI text chat |
| `/api/genai/query/upload` | POST | AI file upload + RAG query |

---

## Contact

- Email: venkatangirala@gmail.com
- Phone: 1-201-888-4128
- Site: https://dataiqsystems.com
