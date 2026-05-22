# Capitol Gains

Capitol Gains is a single Next.js 16 application that serves both the public-facing marketing site and the versioned `/v1/*` API. The app is designed to sit in front of a Supabase-backed cache for normalized congressional trade data, while an upstream Lambda handles collection and transformation before records are exposed through the API.

V1 intentionally scopes the cache/API to two Senate members only: Gary Peters (D-MI) and John Fetterman (D-PA). Both are Democrats because the current FMP-backed demo endpoint is Senate-only, and this scope matches the committed FMP fixture so the first paid-data path can be verified end to end.

## Local setup

```bash
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

The development server runs at [http://localhost:3000](http://localhost:3000).

## Environment variables

Document required variables in `.env.example` and keep machine-specific secrets in `.env.local`, which is ignored by git. Mirror the same variable names in Vercel project settings when you connect the deployment.

## Health check

The scaffold includes a placeholder route at `/api/health` that returns:

```json
{ "status": "ok" }
```

Use it to confirm API routes are working both locally and after Vercel deployment.

## Cache Verification

Run the Epic 3 cache integration check with:

```bash
npx tsx --conditions react-server --env-file=.env.local scripts/verify-epic3-cache.mjs
```

The script normalizes the committed FMP fixture, upserts in-scope V1 trades for Gary Peters and John Fetterman, verifies idempotency/date filtering/freshness, and reconfirms anon-key RLS denial.

Run the Epic 4 local integration check with:

```bash
npx tsx --conditions react-server --env-file=.env.local scripts/verify-epic4-local.mjs
```

This check uses the committed FMP fixture and a mocked FMP fetcher for client/adapter and cache-aside orchestration paths: cold miss, warm hit, date filtering, and upstream failure.

Refresh the live cache manually with:

```bash
npx tsx --conditions react-server --env-file=.env.local scripts/refresh-cache.mjs
```

The refresh script scans the first two FMP `senate-latest` pages, upserts in-scope rows for both V1 senators, marks each member fresh for 24 hours, and prints a JSON summary of pages fetched, FMP calls spent, and rows upserted.
