# Please.market Railway deploy (hackathon demo)

Three services in one project:

| Service | Config | Port |
|---------|--------|------|
| **Postgres** | Railway plugin | — |
| **pleasemarket-worker** | Root `Dockerfile` + `railway.toml` | `$PORT` → `/health` |
| **pleasemarket-web** | `web/Dockerfile`, set **Root Directory** = `web` | 3000 |

## 1. Create project

```bash
cd pronostico-pleasemarket
git init && git add . && git commit -m "Please.market hackathon demo"
railway init --name pleasemarket
railway add --database postgres
```

Link Postgres `DATABASE_URL` to **pleasemarket-worker** (Reference Variable).

## 2. Worker env

```
PLEASE_WEB_URL=https://<pleasemarket-web>.up.railway.app
ANYONE_WEB_BASE=https://<pleasemarket-web>.up.railway.app
PLEASE_DRY_RUN=1
AGENT_DEPLOY_ENABLED=0
OPENAI_API_KEY=<your key>
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Optional org backend (when available):

```
API_URL=https://prod.api.pronostico.market/api
API_TOKEN=
AGENT_SERVICE_SECRET=
```

X webhook (when app is approved):

```
X_API_BEARER_TOKEN=
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
```

## 3. Web service

Create a second service, set **Root Directory** to `web`, deploy `web/Dockerfile`.

**Important:** `web/railway.toml` sets the web healthcheck (`/`) and avoids inheriting the worker’s root `railway.toml` (`python -m src.main`, `/health`). Without it, web deploys fail after a successful build.

Build args / env at deploy time:

```
NEXT_PUBLIC_PLEASE_API_BASE=https://<pleasemarket-worker>.up.railway.app
NEXT_PUBLIC_PLEASE_WEB_URL=https://<pleasemarket-web>.up.railway.app
NEXT_PUBLIC_ANYONE_WEB_BASE=https://anyone.market
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
API_URL=
```

After web URL is known, update worker `PLEASE_WEB_URL` and `ANYONE_WEB_BASE` to match.

## 4. Smoke test

```bash
curl https://<worker>/health
curl https://<worker>/api/leaderboard
curl -X POST https://<worker>/api/x/webhook -H 'Content-Type: application/json' \
  -d '{"tweet_id":"t1","author_id":"u1","author_handle":"demo","text":"@PleaseMarketBot Will it rain in CDMX tomorrow by 6pm?"}'
curl https://<web>/en/market/<documentId-from-reply>
```

## 5. Go live on X

1. Set `PLEASE_DRY_RUN=0`, `AGENT_DEPLOY_ENABLED=1`
2. Set `PLEASE_DEPLOY_ALLOWLIST` to your X user id(s)
3. Register X webhook URL → `https://<worker>/api/x/webhook`

Without org backend, deploy falls back to **demo_markets** in agent Postgres — full create → view → dashboard loop on Please.market web.
