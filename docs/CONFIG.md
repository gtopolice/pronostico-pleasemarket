# Please.market configuration

See root `.env.example` and `web/.env.local.example`.

## Testnet defaults

- `PLEASE_DRY_RUN=1` — parse + preview replies only
- `AGENT_DEPLOY_ENABLED=0` — no Strapi deploy calls
- `PLEASE_DEPLOY_ALLOWLIST` — restrict to team X user ids

## Production checklist

1. Set `AGENT_SERVICE_SECRET` on backend + worker (must match)
2. Fund agent treasury wallet on Base Sepolia/mainnet
3. Register X Account Activity webhook → `POST /api/x/webhook`
4. Privy app id shared with TMA
5. `PLEASE_WEB_URL` DNS → Railway web service
