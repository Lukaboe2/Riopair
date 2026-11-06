# LUKA-AI Pair

WhatsApp pairing/session generator built with Express and Baileys.

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:50900/pair` (or the port set in `PORT`).

## Deploy on Railway

1. Push this project to a GitHub repository.
2. In Railway, create a project and choose **Deploy from GitHub Repo**.
3. Select this repository. Railway uses `railway.json` and the included `Dockerfile`.
4. Add environment variables as needed:
   - `SESSION_PREFIX=LUKA~`
   - `DATABASE_URL` (optional; MongoDB or PostgreSQL URL for short session IDs)
   - `GC_JID`, `BOT_REPO`, `WA_CHANNEL` (optional overrides)
5. Deploy, then open the generated domain and visit `/pair`.
6. Check `/health` to confirm the service is running.

Railway supplies `PORT` automatically. The app listens on that port.

## Deploy on Koyeb

1. Push this project to GitHub.
2. In Koyeb, create **Web Service** → choose GitHub and select this repository.
3. Choose **Docker** / use the repository `Dockerfile` as the build method.
4. Set the service port to `8000` and add environment variables:
   - `PORT=8000`
   - `SESSION_PREFIX=LUKA~`
   - `DATABASE_URL` (optional; MongoDB or PostgreSQL URL for short session IDs)
   - `GC_JID`, `BOT_REPO`, `WA_CHANNEL` (optional overrides)
5. Deploy, then open the service domain and visit `/pair`.
6. Check `/health` to confirm the service is running.

## Database and session notes

- `DATABASE_URL` accepts MongoDB (`mongodb://` / `mongodb+srv://`) or PostgreSQL (`postgres://` / `postgresql://`).
- Configure a database if you want short session IDs to be retrievable from `/session/:id`.
- Without a database, the service uses inline session fallback and returns the full session string instead of a short database-backed ID.
- Container filesystems may be ephemeral. Do not rely on local files for permanent session storage.
- Keep generated session strings private; they grant access to the linked WhatsApp account.

## Routes

- `/` – landing page
- `/pair` – pairing code page
- `/code?number=255XXXXXXXXX&type=long` – pairing API (`type=short` or `long`)
- `/qr` – QR page
- `/qr/session` – QR session endpoint
- `/health` – health check
- `/session/:id` – retrieve a stored short session (database required)

## Render

The `render.yaml` file is retained for users deploying on Render. Railway and Koyeb use the included Dockerfile.


## Recommended deployment: Vercel frontend + Railway API

This project can be deployed as two services because Baileys needs a persistent Node.js process.

### 1. Deploy the backend on Railway
1. Push this project to GitHub.
2. In Railway, create a new project and deploy the GitHub repository. Railway will use the included `Dockerfile` and `railway.json`.
3. In the Railway service settings, generate a public domain. Copy the HTTPS domain.
4. Add these variables in Railway (set `FRONTEND_URL` to your actual Vercel website origin):
   - `SESSION_PREFIX=LUKA~`
   - `FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app`
   - `GC_JID=` (optional)
   - `BOT_REPO=https://github.com/Lukabrand/LUKA-XMD`
   - `WA_CHANNEL=https://whatsapp.com/channel/0029Vb9cTL57z4kh6oBTcr3h`
   - `DATABASE_URL=` (optional; required only if you want database-backed short sessions)
5. Wait for deployment, then open `https://YOUR-RAILWAY-DOMAIN/health`. It should return JSON with `success: true`.

### 2. Configure and deploy the frontend on Vercel
1. Open `public/api-config.js`.
2. Replace `https://YOUR-RAILWAY-DOMAIN.up.railway.app` with the exact Railway HTTPS domain (no trailing slash).
3. In Vercel, import the same GitHub repository. Keep the project Root Directory at the repository root (default), so `vercel.json` is applied.
4. Deploy. The `public` folder contains the static pages and `api-config.js`.
5. Open the Vercel domain, visit `/pair`, and request a pair code. The QR page also sends its session request to Railway.

### Important
- Do not deploy the backend as a Vercel static-only project.
- If you change the Vercel domain, update Railway's `FRONTEND_URL` and redeploy/restart the Railway service.
- If Railway's domain changes, update `public/api-config.js` and redeploy Vercel.
- A database is optional for long sessions. Short sessions require a working MongoDB or PostgreSQL `DATABASE_URL`; without it, the backend returns the full session string instead.

