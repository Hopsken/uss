# USS

Single-image Docker deploy supported.

## Run with Docker Compose

```bash
docker compose up --build -d
```

Check container health:

```bash
docker compose ps
```

`STATE` should become `running (healthy)`.

## Run with plain Docker

```bash
docker build -t uss:local .
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

Check health:

```bash
docker ps
docker inspect --format='{{.State.Health.Status}}' "$(docker ps -q --filter ancestor=uss:local | head -n 1)"
```

Expected health value: `healthy`.

## Health endpoint

```bash
curl http://localhost:3000/v1/health
```
