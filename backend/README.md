# DeFlock Safford — Petition Backend (FALLBACK / not currently live)

> **Status:** The live petition runs on **Action Network** (free grassroots tier),
> chosen to keep custodial risk off a single maintainer and avoid ad-tracking on
> signers. This self-hosted stack is kept as a documented fallback in case the
> campaign ever needs full data custody or outgrows the hosted option. It is
> complete and deployable, but not wired into the live site.

A minimal, privacy-first API that records petition signatures into Supabase.

## Why this exists separately from the site

The site is a static Astro build on GitHub Pages. A static page cannot hold a
secret — anything baked into it is public. This small service is the only place
the Supabase **service key** lives. The browser posts here; it never sees the key.

## Privacy design

- Stores the minimum: optional display name, email (dedup/verify only), optional city, a consent flag, a timestamp.
- **No IP logging, no user-agent, no analytics, no geolocation.**
- Row Level Security is ON in Supabase: the public can INSERT a signature but can **never read the list back**. Only the server (service key) can read it.
- Public endpoints expose only an aggregate count and, optionally, the display names of people who explicitly consented.

This matters: the signer list is a list of local people opposing a surveillance
program. Minimizing what's collected and held is the protection.

## Endpoints

- `GET /health` — health check
- `GET /count` — total signature count (no rows exposed)
- `GET /public-signatures` — consented display names only
- `POST /sign` — `{ email, display_name?, city?, public_consent? }`

## Setup (you run these — they're account actions)

1. **Create a Supabase project** at supabase.com. In the SQL editor, run `schema.sql`.
2. **Create the Railway project** (`railway login`, then `railway init` or link the repo).
3. **Set Railway variables** (never commit these):
   ```
   railway variables --set SUPABASE_URL=https://YOUR-ref.supabase.co
   railway variables --set SUPABASE_SERVICE_KEY=YOUR-service-role-key
   railway variables --set ALLOWED_ORIGIN=https://mnehmos.github.io
   ```
4. **Deploy**:
   ```
   railway up
   ```
5. Copy the public URL Railway gives you and put it in the petition page's `API_BASE`.

## Local testing

```
cp .env.example .env   # fill in real values — .env is gitignored
npm install
npm start
```

## Never commit

`.env`, the service key, or any live credential. They live in Railway's
environment only. `.gitignore` is set up to block them — keep it that way.
