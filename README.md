# Please.market — X prediction-market agent for Anyone

Standalone Railway service: Python agent worker + FastAPI BFF + Next.js dashboard.

## Quick start

```bash
cp .env.example .env
# fill API_URL, AGENT_SERVICE_SECRET, OPENAI_API_KEY, DATABASE_URL

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m src.main
```

Web dashboard:

```bash
cd web && npm install && npm run dev
```

## Architecture

- **Agent worker** polls X mentions (webhook), parses via LLM, deploys via org `POST /api/agent/please-market/markets/deploy`
- **Org backend** (`pronostico-backend` @ feat/testnet) — Strapi market rows, wallet link, referral clicks
- **Trades** on [anyone.market](https://anyone.market); Telegram bot picks up via existing Strapi polls

See `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/CONFIG.md`.

## Env

| Variable | Purpose |
|----------|---------|
| `AGENT_DEPLOY_ENABLED` | `1` to live-deploy (default off) |
| `PLEASE_DRY_RUN` | `1` preview replies without deploy |
| `PLEASE_DEPLOY_ALLOWLIST` | Comma-separated X user ids for testnet |

## Deploy

Railway: connect repo, set env vars, deploy `Dockerfile`. Optional second service for `web/`.
