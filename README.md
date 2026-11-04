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
