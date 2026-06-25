# Deployment Guide

This guide covers deploying the Questify backend to Railway, Render, and running it with Docker. All platforms run the same compiled Node.js output (`dist/server.js`).

---

## Table of Contents

1. [Pre-deployment checklist](#1-pre-deployment-checklist)
2. [Railway](#2-railway)
3. [Render](#3-render)
4. [Docker / Self-hosted](#4-docker--self-hosted)
5. [Environment variables per platform](#5-environment-variables-per-platform)
6. [Database backup strategies](#6-database-backup-strategies)
7. [Monitoring setup](#7-monitoring-setup)

---

## 1. Pre-deployment checklist

Before deploying to any platform:

- [ ] `npm run build` succeeds locally with zero TypeScript errors
- [ ] `npm test` passes (or at minimum `npm run test:unit`)
- [ ] All required environment variables are documented and ready
- [ ] MongoDB Atlas cluster exists for production (separate from dev/test clusters)
- [ ] Production Atlas cluster has IP access list configured (see section 5)
- [ ] `NODE_ENV=production` will be set on the platform
- [ ] `ENABLE_DOCS=false` (Swagger disabled in production)
- [ ] `LOG_FORMAT=combined` for structured log output
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are 64-char random hex strings — NOT the same value, NOT the dev values

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# run twice — once per secret
```

---

## 2. Railway

Railway is the recommended platform. It handles builds, deploys, and environment injection automatically.

### 2.1 Initial setup

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your Questify repository
4. Railway detects Node.js automatically — no Dockerfile needed

### 2.2 Configure the service

In your Railway project, click the service → **Settings**:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Railway sets `PORT` automatically — do not override it.

### 2.3 Set environment variables

Go to **Variables → Raw editor** and paste:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char hex>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<different 64-char hex>
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=12
LOG_FORMAT=combined
APP_URL=https://your-frontend.vercel.app
ENABLE_DOCS=false
CLERK_SECRET_KEY=sk_live_...
```

### 2.4 MongoDB Atlas — allow Railway IPs

Railway uses dynamic IPs. The easiest approach for Atlas:

- **Development/staging:** Allow `0.0.0.0/0` (all IPs)
- **Production:** Use Railway's static outbound IPs (available on paid plans) and add them to Atlas Network Access

### 2.5 Deploy

Railway deploys automatically on every push to your configured branch. To trigger a manual deploy, click **Deploy → Deploy now**.

### 2.6 Custom domain

In **Settings → Networking → Custom Domain**, add your domain and Railway generates a TLS certificate automatically.

---

## 3. Render

### 3.1 Initial setup

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Choose the `backend` directory as the root (if using a monorepo)

### 3.2 Configure the service

| Setting | Value |
|---------|-------|
| Environment | Node |
| Region | Choose closest to your users |
| Branch | `main` |
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

### 3.3 Set environment variables

Go to **Environment** and add each variable. The full list is identical to the Railway section above.

Render also supports **Environment Groups** — create a group called `questify-production` and share it across services.

### 3.4 MongoDB Atlas — allow Render IPs

Render provides static outbound IPs on paid plans (shown in **Settings → Outbound IPs**). Add those to Atlas Network Access. On free plans, allow `0.0.0.0/0`.

### 3.5 Scaling

- **Free tier:** Spins down after 15 minutes of inactivity (cold starts ~30s)
- **Starter tier ($7/month):** Always-on, recommended for any real usage
- **Horizontal scaling:** Render supports multiple instances — set `NODE_ENV=production` and ensure no shared local state (the codebase is stateless — this is safe)

---

## 4. Docker / Self-hosted

### 4.1 Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8000/health || exit 1

CMD ["node", "dist/server.js"]
```

### 4.2 Build and run

```bash
# Build the image
docker build -t questify-backend:latest .

# Run with an env file
docker run -d \
  --name questify-api \
  -p 8000:8000 \
  --env-file .env.production \
  --restart unless-stopped \
  questify-backend:latest

# Check health
curl http://localhost:8000/health
```

### 4.3 Docker Compose (with local MongoDB for development)

```yaml
# docker-compose.yml
version: "3.9"
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.runCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongo_data:
```

```bash
docker compose up -d
docker compose logs -f api
```

---

## 5. Environment variables per platform

### Required (all platforms)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Must be `production` |
| `MONGODB_URI` | Atlas connection string for the production cluster |
| `JWT_SECRET` | 64-char random hex, min 32 chars |
| `JWT_REFRESH_SECRET` | Different 64-char random hex, min 32 chars |
| `ALLOWED_ORIGINS` | Your frontend's production URL |

### Optional with production-recommended values

| Variable | Dev default | Production recommended |
|----------|-------------|----------------------|
| `PORT` | `8000` | Injected by platform |
| `JWT_EXPIRES_IN` | `7d` | `7d` or `1d` for tighter security |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | `30d` |
| `RATE_LIMIT_WINDOW_MS` | `900000` | `900000` |
| `RATE_LIMIT_MAX` | `100` | `50`–`100` (tune to your traffic) |
| `BCRYPT_ROUNDS` | `12` | `12` |
| `LOG_FORMAT` | `dev` | `combined` |
| `ENABLE_DOCS` | (always on in dev) | `false` |

### Platform-injected variables

| Platform | Variable injected automatically |
|----------|---------------------------------|
| Railway | `PORT`, `RAILWAY_ENVIRONMENT` |
| Render | `PORT`, `RENDER`, `IS_PULL_REQUEST` |

Do not set `PORT` manually on Railway or Render.

---

## 6. Database backup strategies

### MongoDB Atlas automated backups

Atlas M10+ clusters include automated backups. For production:

1. Go to **Atlas → Cluster → Backup**
2. Enable **Continuous Cloud Backup** (M10+) or **Cloud Backup** (scheduled snapshots)
3. Set retention to at least **7 days**
4. Configure a **weekly snapshot** for long-term retention

For M0 (free) clusters, Atlas does not offer automated backups — export manually:

```bash
# Export all collections to BSON
mongodump \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/questify" \
  --out=./backups/$(date +%Y-%m-%d)

# Restore from a backup
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/questify" \
  ./backups/2025-09-01
```

### Automated daily exports (cron)

Set up a cron job on your server or CI/CD to run `mongodump` daily and upload to S3 or cloud storage:

```bash
# Cron — run at 02:00 UTC every day
0 2 * * * /usr/bin/mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y-\%m-\%d) \
  && aws s3 sync /backups/ s3://your-bucket/questify-backups/ \
  && find /backups/ -mtime +7 -exec rm -rf {} +
```

### Point-in-time recovery

Atlas M10+ supports point-in-time recovery to any second within the retention window:

1. **Atlas → Cluster → Backup → Restore**
2. Choose **Point in Time**
3. Select the target timestamp
4. Restore to the same cluster or a new one

---

## 7. Monitoring setup

### Health endpoint

The API exposes a health check at `GET /health`:

```json
{
  "success": true,
  "message": "OK",
  "env": "production",
  "timestamp": "2025-09-01T08:00:00.000Z"
}
```

Configure your platform's health check to ping `/health` every 30 seconds.

### Uptime monitoring

Use a free external monitor so you're alerted independently of the platform:

- **UptimeRobot** (free tier, 5-minute checks) — add your API URL + `/health`
- **Better Uptime** — integrates with Slack and PagerDuty
- **Checkly** — supports scripted browser + API checks

### Application metrics (Railway)

Railway's built-in metrics show CPU, memory, and request count. For deeper visibility:

### Logging aggregation

With `LOG_FORMAT=combined`, Morgan outputs Apache-style logs. Pipe them to:

- **Railway:** Logs are streamed in the dashboard; export to Datadog or Papertrail via the Railway integrations panel
- **Render:** Connect a **Log Stream** under **Settings → Log Stream** (supports Datadog, Papertrail, Logdna)
- **Self-hosted:** Use `winston` or redirect stdout to a file + ship with Filebeat/Fluentd

### Error tracking

Install Sentry for exception capture:

```bash
npm install @sentry/node
```

In `src/server.ts`, initialise before any other imports:

```typescript
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });
```

Add the Sentry error handler in `src/app.ts` **after** all routes but **before** the existing `errorHandler`:

```typescript
import * as Sentry from "@sentry/node";
app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);
```

Add `SENTRY_DSN` to your environment variables (get it from sentry.io → Project → Settings → SDK Setup).

### Atlas monitoring

MongoDB Atlas provides built-in cluster monitoring:

- **Atlas → Metrics** — query execution time, connections, opcounters
- **Performance Advisor** — automatically recommends missing indexes
- **Alerts** — configure alerts for high query latency, connection count spikes, or disk usage thresholds
