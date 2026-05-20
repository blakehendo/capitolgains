# Capitol Gains

Capitol Gains is a single Next.js 16 application that serves both the public-facing marketing site and the versioned `/v1/*` API. The app is designed to sit in front of a Supabase-backed cache for normalized congressional trade data, while an upstream Lambda handles collection and transformation before records are exposed through the API.

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
