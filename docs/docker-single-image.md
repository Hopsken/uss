# Single-Image Docker Deploy

This project can run as a single Docker image with one public port (`3000`).

## Build

```bash
docker build -t uss:local .
```

## Run (plain Docker)

```bash
docker run --rm \
  -p 3000:3000 \
  -v uss-data:/var/lib/uss \
  -e BETTER_AUTH_SECRET='replace-me' \
  -e AUTH_BOOTSTRAP_RESET_SECRET='replace-me' \
  -e USS_PUBLIC_BASE_URL='http://localhost:3000' \
  -e API_CORS_ORIGINS='http://localhost:3000' \
  -e OPENCLAW_GATEWAY_URL='ws://host.docker.internal:18789' \
  -e OPENCLAW_GATEWAY_TOKEN='' \
  uss:local
```

## Run (Compose)

```bash
docker compose up --build -d
```

Default compose file uses volume `uss-data` mapped to `/var/lib/uss`, so SQLite data persists across container restarts.

## Runtime Model

- Public entrypoint: Next.js on port `3000`.
- Internal API: Elysia on port `8787`.
- Web app proxies `/v1/*` and `/api/auth/*` to internal API using `API_INTERNAL_BASE_URL`.

## Key Environment Variables

- `BETTER_AUTH_SECRET` (required in production).
- `AUTH_BOOTSTRAP_RESET_SECRET` (recommended).
- `USS_PUBLIC_BASE_URL` (set to your public URL, for example `https://uss.example.com`).
- `API_CORS_ORIGINS` (comma-separated allowed origins).
- `OPENCLAW_GATEWAY_URL` and `OPENCLAW_GATEWAY_TOKEN`.
- `DATABASE_URL` (default `file:/var/lib/uss/uss.db`).

## Health Check

```bash
curl http://localhost:3000/v1/health
```

Expected response includes `status: "ok"`.
