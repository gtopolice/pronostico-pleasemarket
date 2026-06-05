# Chiwiwis configuration

See root `.env.example` and `web/.env.local.example`.

## Testnet defaults

- `CHIWIWIS_DRY_RUN=1` — parse + preview replies only
- `AGENT_DEPLOY_ENABLED=0` — no Strapi deploy calls
- `CHIWIWIS_DEPLOY_ALLOWLIST` — restrict to team X user ids

## Production checklist

1. Set `AGENT_SERVICE_SECRET` on backend + worker (must match)
2. Fund agent treasury wallet on Base Sepolia/mainnet
3. Register X Account Activity webhook → `POST /api/x/webhook`
4. Privy app id shared with TMA
5. `CHIWIWIS_WEB_URL` DNS → Railway web service
