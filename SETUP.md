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
```

Install Git:
```bash
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

Every time you push new code, SSH in and run:

```bash
cd /opt/data-ai-solutions
git pull
docker compose up -d --build
```

Or from your local machine (if SSH key is set up):

```bash
ssh root@142.93.177.153 "cd /opt/data-ai-solutions && git pull && docker compose up -d --build"
```

---

## 7. Optional — Run on Port 80 with Nginx

Install Nginx on the server:
```bash
apt-get install -y nginx
```

Create config `/etc/nginx/sites-available/dataai`:
```nginx
server {
    listen 80;
    server_name 142.93.177.153;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
ln -s /etc/nginx/sites-available/dataai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

Site now accessible at **http://142.93.177.153** (port 80).

---

## 8. GitHub Setup (First Time)

```bash
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Create repo on github.com/new, then:
git remote add origin https://github.com/prasadvenkat22/data-ai-solutions.git
git push -u origin master
```

---

## 9. Project Structure

```
data-ai-solutions/
├── src/
│   ├── components/
│   │   ├── Layout.tsx        # Footer + navbar wrapper
│   │   ├── Navbar.tsx        # Top navigation
│   │   └── AIChatWidget.tsx  # Bottom-right AI chat
│   ├── lib/
│   │   └── api.ts            # FastAPI client functions
│   ├── pages/
│   │   ├── index.tsx         # Home page
│   │   ├── services.tsx      # Services listing
│   │   ├── customers.tsx     # Customer CRUD
│   │   ├── users.tsx         # User management
│   │   └── registrations.tsx # Demo booking
│   ├── styles/
│   │   └── globals.css       # Global styles + datepicker theme
│   └── types/
│       └── index.ts          # TypeScript types
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Docker Compose config
├── .env.local.example        # Environment template
└── SETUP.md                  # This file
```

---

## 10. FastAPI Backend Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /CRUD/register/` | Register user |
| `GET /CRUD/users/` | List users |
| `GET/POST /CRUD/customers/` | Customer management |
| `PUT/DELETE /CRUD/customers/{id}` | Edit/delete customer |
| `GET/POST /CRUD/services/` | Services catalog |
| `GET/POST /CRUD/registrations/` | Demo registrations |
| `POST /api/genai/llm` | AI text chat |
| `POST /api/genai/query/upload` | AI file upload + query |

---

## Contact

- Email: venkatangirala@gmail.com
- Phone: 1-201-888-4128
