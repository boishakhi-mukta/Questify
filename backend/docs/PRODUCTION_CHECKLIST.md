# Production Checklist

Run through this checklist before every production deployment. Each section is independent — check them in any order, but check all of them.

---

## 1. Security

### Authentication & secrets

- [ ] `JWT_SECRET` is at least 64 characters of random hex — not a dictionary phrase
- [ ] `JWT_REFRESH_SECRET` is different from `JWT_SECRET`
- [ ] Neither secret is committed to git (check `git log --all -- .env`)
- [ ] `.env` is in `.gitignore`
- [ ] Secrets are rotated from development values — never reuse dev secrets in production

```bash
# Verify .env is not tracked
git ls-files .env
# Should return nothing
```

### HTTP security headers

- [ ] Helmet is active (`app.use(helmet())` appears in `app.ts`)
- [ ] `ENABLE_DOCS=false` — Swagger UI is not exposed without authentication
- [ ] CORS `ALLOWED_ORIGINS` is set to the exact production frontend URL (not `*`)

### Rate limiting

- [ ] `RATE_LIMIT_MAX` is set appropriately for expected traffic (≤ 100 req/window for public endpoints)
- [ ] Auth endpoints have a tighter limit — confirm `authLimiter` is applied to `/api/v1/auth`
- [ ] Rate limiter trust proxy is configured if behind a reverse proxy (Railway/Render handle this)

### Input validation

- [ ] All incoming payloads are validated by a Zod schema before hitting the controller
- [ ] File upload endpoints (if any) validate MIME type and file size
- [ ] No raw user input is concatenated into MongoDB queries (Mongoose prevents most injection by design)

### Dependency audit

```bash
npm audit
# Review all HIGH and CRITICAL findings before deploying
npm audit fix   # auto-fix where safe
```

- [ ] `npm audit` shows zero HIGH or CRITICAL vulnerabilities
- [ ] Dependencies are pinned or have a known-safe semver range

### Passwords

- [ ] `BCRYPT_ROUNDS=12` or higher in production
- [ ] No plaintext passwords appear in logs (check Morgan format — `combined` does not log body)
- [ ] Admin-created users receive `tempPassword` in the response body only — not stored in logs

---

## 2. Performance

### Build

- [ ] Running the production build (`npm run build`) — server starts from `dist/server.js`, not `ts-node`
- [ ] TypeScript `strict` mode is enabled — no `any` casts that hide type errors

### Database

- [ ] All Mongoose models have indexes for commonly queried fields (use Atlas Performance Advisor)
- [ ] No `find()` calls without a filter on large collections
- [ ] Pagination is applied on all list endpoints (`limit` and `page` params enforced)
- [ ] Atlas cluster tier is appropriate for expected load (M0 is unsuitable for production traffic)

### Response size

- [ ] Large collections use cursor-based or offset pagination — not returning unlimited arrays
- [ ] `select()` is used to exclude large or sensitive fields from list responses (e.g. `passwordHash`)
- [ ] Body parser limit is set appropriately (`express.json({ limit: "10kb" })` — adjust if needed for file metadata payloads)

### Keep-alive and timeouts

- [ ] MongoDB connection pool is sized correctly (Mongoose default is 5 — increase for high concurrency)
- [ ] Server has a request timeout configured to prevent hanging connections

---

## 3. Database

### Connection

- [ ] `MONGODB_URI` points to the production Atlas cluster — not the dev or test cluster
- [ ] Connection string uses `retryWrites=true&w=majority` for durability
- [ ] Atlas cluster IP access list is locked down to platform IPs (not `0.0.0.0/0` if avoidable)

### Indexes

Run in MongoDB Shell or Atlas Data Explorer before go-live:

```javascript
// Verify key indexes exist
db.users.getIndexes()
db.enrollments.getIndexes()
db.xps.getIndexes()
db.attendances.getIndexes()
```

- [ ] `users`: index on `email` (unique)
- [ ] `enrollments`: compound index on `{ studentId, courseId }` (unique)
- [ ] `xps`: sparse compound indexes for `unique_attendance_xp`, `unique_submission_xp`, `unique_material_xp`
- [ ] `courses`: index on `status`, `teacherId`
- [ ] `assignments`: index on `courseId`

### Data integrity

- [ ] Production database has NOT been seeded with test data
- [ ] Seed scripts (`npm run seed:*`) have been tested on a staging database first
- [ ] If a seed was accidentally run in production: `npm run seed:reset` requires `NODE_ENV=production` confirmation prompt

### Backups

- [ ] Atlas automated backups are enabled (requires M10+ cluster)
- [ ] At least one manual snapshot taken before the first production deployment
- [ ] Backup restore procedure has been tested on a staging database
- [ ] Backup retention is at least 7 days

---

## 4. Monitoring

### Health check

- [ ] `/health` endpoint returns `200 OK` with `{ "success": true }` after deployment
- [ ] Platform health check is configured to poll `/health` every 30s
- [ ] Health check failure triggers an alert (email, Slack, PagerDuty)

### Uptime monitoring

- [ ] An external uptime monitor (UptimeRobot, Better Uptime, Checkly) is configured
- [ ] Monitor checks the `/health` endpoint, not just the root URL
- [ ] Alert latency is under 5 minutes

### Logging

- [ ] `LOG_FORMAT=combined` is set — structured Apache-style logs in production
- [ ] Logs are being collected (Railway dashboard, Render log stream, or a log aggregator)
- [ ] Logs are retained for at least 30 days
- [ ] No sensitive data (passwords, tokens) appears in request logs (Morgan `combined` format logs headers but not body — confirm no custom body-logging middleware is active)

### Error tracking

- [ ] Sentry (or equivalent) is set up and `SENTRY_DSN` is set
- [ ] A test error has been triggered and confirmed to appear in Sentry before go-live
- [ ] Error alert thresholds are configured (e.g. alert if >10 errors/minute)

### Atlas alerts

Configure in Atlas → Cluster → Alerts:

- [ ] **Query execution time** > 100ms average over 5 minutes
- [ ] **Connections** > 80% of cluster's max connections
- [ ] **Disk utilisation** > 75%
- [ ] **Replication lag** > 10 seconds (replica sets only)

---

## 5. Incident response

### Runbook

**Service is down (health check failing)**

1. Check platform status page (Railway: [status.railway.app](https://status.railway.app), Render: [status.render.com](https://status.render.com))
2. Check the deployment logs for startup errors — common causes:
   - Missing env var → `❌ Invalid environment variables`
   - MongoDB connection refused → `MongoServerError`
   - Port already in use → `EADDRINUSE`
3. If logs show `MongoServerError: bad auth`: verify `MONGODB_URI` is correct and the Atlas user password hasn't been rotated
4. If logs show `Invalid environment variables`: a required env var was removed — re-add it and redeploy
5. Roll back to the last known-good deployment if the issue isn't immediately resolvable

**High error rate (5xx responses spiking)**

1. Check Sentry for the exception type and stack trace
2. Check if a recent deployment correlates with the spike (compare deploy time vs. error start time)
3. If correlated, roll back the deployment immediately
4. Identify the failing endpoint from the error code (`requestId` in the error response links to the log line)
5. Fix, test locally, deploy a patch

**Database performance degradation (slow queries)**

1. Open Atlas → Performance Advisor
2. Look for queries without indexes — Performance Advisor flags these automatically
3. Add the recommended index(es) in Atlas (no downtime required for index builds on M10+)
4. If a specific query is the culprit, identify it by the slow query log and optimise with `.select()`, `.lean()`, or a covering index

**Accidental data deletion**

1. Stop any ongoing operations that could overwrite data
2. Immediately take a manual Atlas snapshot (Atlas → Cluster → Backup → Take Snapshot Now)
3. Contact the MongoDB Atlas support team to initiate a point-in-time restore if the Atlas tier supports it
4. If on M0 (no PITR): restore from the most recent `mongodump` export
5. Audit the deletion path in the codebase and add an `isDeleted` soft-delete flag or admin confirmation gate

### Escalation contacts

Fill in before go-live:

| Role | Name | Contact |
|------|------|---------|
| Backend on-call | | |
| Database admin | | |
| Platform (Railway/Render) | | Support ticket |
| MongoDB Atlas support | | atlas.mongodb.com → Support |

### Communication template

When an incident is confirmed:

```
Status: [INVESTIGATING | IDENTIFIED | MONITORING | RESOLVED]
Impact: [describe what's broken and who is affected]
Started: [time in UTC]
Cause: [brief description once identified]
Next update: [time in UTC]
```

Post updates every 30 minutes until resolved.

### Post-incident review

After every P0 or P1 incident, complete a blameless post-mortem:

- [ ] Timeline of events documented
- [ ] Root cause identified
- [ ] Fix deployed and verified
- [ ] Preventive measures added (alert threshold, test, validation)
- [ ] Runbook updated with new learnings
