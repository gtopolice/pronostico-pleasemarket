# Please.market — hackathon handoff (read this in new Cursor sessions)

**Repo:** `/home/alex/Code/pronostico-pleasemarket`  
**Parent startup:** [Anyone](https://anyone.market) (Pronóstico Labs) — social prediction markets on Base Sepolia  
**This repo:** **Please.market** — X-native AI agent that creates markets from tweets. A **product branch** of Anyone, not a separate company.

---

## Elevator pitch (for Skool / judges)

> **Anyone** lets people create and trade binary prediction markets on Base. **Please.market** is the X distribution layer: tag `@PleaseMarketBot` with a question → AI parses it → market goes live → creator resolves. Gasless Privy wallets, no Web3 onboarding. Built for ETH Mexico / Bitso hackathon (AI × blockchain × payments).

---

## Live demo (Railway — deployed, no GitHub remote yet)

| What | URL |
|------|-----|
| **Web** | https://chiwiwis-web-production.up.railway.app |
| **Worker API** | https://chiwiwis-worker-production.up.railway.app |
| **Health** | https://chiwiwis-worker-production.up.railway.app/health |
| **Example market** | https://chiwiwis-web-production.up.railway.app/en/market/f9c22ea8-8124-4038-86ae-fee2c2a8f295 |
| **Railway project** | https://railway.com/project/1c36e152-3a3e-42f8-80ea-aab08f3da718 |

**Mode:** `PLEASE_DRY_RUN=1` — preview markets stored in agent Postgres (`demo_markets`), not on-chain.

**Note:** Railway hostnames still say `chiwiwis-*` (legacy deploy name). UI branding is Please.market.

---

## 5-minute demo script

```bash
# 1) Link wallet (once per X user id)
curl -sS -X POST https://chiwiwis-worker-production.up.railway.app/api/link-x/init \
  -H 'Content-Type: application/json' \
  -d '{"twitter_id":"you123","twitter_handle":"you"}'
# → open link_url in browser → Privy sign-in → Complete link

# 2) Simulate tweet → creates preview market
curl -sS -X POST https://chiwiwis-worker-production.up.railway.app/api/x/webhook \
  -H 'Content-Type: application/json' \
  -d '{"tweet_id":"demo-'$(date +%s)'","author_id":"you123","author_handle":"you","text":"@PleaseMarketBot Will ETH Mexico sell out before Sunday?"}'

# 3) Dashboard (sign in with same Privy wallet)
open https://chiwiwis-web-production.up.railway.app/dashboard
```

**Mention handles accepted:** `@PleaseMarketBot`, `@Chiwiwis`, `@pleasemarket`, `@pleasemarketbot` (webhook normalizes all).

---

## Stack (no agent framework)

| Layer | Tech |
|-------|------|
| Agent | Custom Python — **not** OpenClaw/LangChain |
| HTTP / webhook | FastAPI + uvicorn |
| LLM | OpenAI SDK (`PLEASE_LLM_MODEL`, fallback parser if no key) |
| DB | Postgres (dedupe, wallet links, demo markets, audit) |
| Web | Next.js 15 standalone + Privy + smart wallets (Base Sepolia) |
| Deploy | Railway: worker + web + Postgres |

---

## Repo layout

```
pronostico-pleasemarket/
├── src/
│   ├── api/app.py          # FastAPI: webhook, link-x, demo API, leaderboard
│   ├── x/webhook.py        # Mention → parse → deploy/dry-run
│   ├── intent/parser.py    # OpenAI structured JSON
│   ├── markets/deploy.py   # Org API deploy + demo_markets fallback
│   ├── db/wallet_link.py   # X ↔ wallet (Postgres)
│   └── ...
├── web/                    # Next.js dashboard + market pages
├── Dockerfile              # worker
├── web/Dockerfile          # web (set Root Directory = web on Railway)
├── railway.toml            # worker
└── docs/
    ├── HANDOFF.md          # ← this file
    ├── RAILWAY.md
    └── ARCHITECTURE.md
```

---

## What's done vs not

### ✅ Shipped (hackathon demo path)

- X webhook ingest + LLM parse + moderation + rate limits
- Wallet link flow (`/link-x`) — token-based, **no X OAuth in Privy** (trust-on-token)
- Dry-run markets → `demo_markets` table → `/en/market/[id]` page
- Dashboard with demo profile/markets fallback (`/api/demo/*` proxies)
- Privy embedded wallet + smart wallet on Base Sepolia
- Deployed on Railway (worker + web + Postgres)

### ❌ Not deployed / not merged

- **`pronostico-backend`** — `please-market-agent` API module exists **locally only** at `/home/alex/Code/pronostico-backend/src/api/chiwiwis-agent/` (routes still named chiwiwis in folder). Needed for real Strapi markets + anyone.market + Telegram alerts.
- **Live X bot** — no production X API credentials on Railway yet; demo uses `curl` webhook simulation.
- **On-chain deploy** — dry-run only; production path is Strapi `REVIEWED` row → Anyone deploy pipeline.
- **GitHub remote** — repo is local `master` only; push before DoraHacks submission (needs GitHub + demo video).

---

## Related repos (do not confuse)

| Repo | Role |
|------|------|
| **`pronostico-pleasemarket`** (this) | X agent + hackathon demo |
| **`pronostico`** (`/home/alex/Code/pronostico`) | Anyone Telegram bot + TMA — **unchanged** for hackathon |
| **`pronostico-backend`** (local fork) | Strapi API — agent deploy endpoints when merged |

---

## Env vars (worker)

```bash
PLEASE_WEB_URL=https://chiwiwis-web-production.up.railway.app
ANYONE_WEB_BASE=https://chiwiwis-web-production.up.railway.app  # or anyone.market in prod
PLEASE_DRY_RUN=1
AGENT_DEPLOY_ENABLED=0
PLEASE_X_HANDLE=PleaseMarketBot
DATABASE_URL=${{Postgres.DATABASE_URL}}
OPENAI_API_KEY=...
# Optional org backend:
API_URL=https://prod.api.pronostico.market/api
AGENT_SERVICE_SECRET=...
```

## Env vars (web — build time `NEXT_PUBLIC_*`)

```bash
NEXT_PUBLIC_PLEASE_API_BASE=https://chiwiwis-worker-production.up.railway.app
NEXT_PUBLIC_PLEASE_WEB_URL=https://chiwiwis-web-production.up.railway.app
NEXT_PUBLIC_PRIVY_APP_ID=...   # same app as Anyone TMA
```

Legacy `CHIWIWIS_*` env names still work (aliases in `src/config.py`).

---

## Local dev

```bash
cd /home/alex/Code/pronostico-pleasemarket
docker compose up -d postgres
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m src.main   # :8080

cd web && npm install && npm run dev   # :3000
```

---

## Known issues (as of last session)

1. **Dashboard empty wallet** — Privy session can be `authenticated` without wallet loaded; fixed in code (show Sign in again + demo API proxy). Redeploy web after pulls.
2. **Link token one-time** — "token expired" = already used or >60min; generate new via `/api/link-x/init`.
3. **`@PleaseMarketBot` vs `@Chiwiwis`** — worker accepts both; ensure `PLEASE_X_HANDLE=PleaseMarketBot` on Railway.
4. **Railway service names** — still `chiwiwis-worker` / `chiwiwis-web` in dashboard.

---

## Deploy commands

```bash
cd /home/alex/Code/pronostico-pleasemarket
railway link   # project: chiwiwis
railway up -s chiwiwis-worker -d
railway up web --path-as-root -s chiwiwis-web -d
```

See `docs/RAILWAY.md`.

---

## Hackathon submission checklist

- [ ] Push repo to public GitHub
- [ ] Record 2–3 min demo video (Anyone → Please.market → curl webhook → market page → dashboard)
- [ ] Submit Skool: ETH Mexico startup track + Bitso startup track
- [ ] Optional: [DoraHacks BUIDL](https://dorahacks.io/hackathon/ethmexico2026bitso/detail) (GitHub + video required)
- [ ] Notion guide: https://ethereumexico.notion.site/Ethereum-Mexico-Guide-Prizes-3576a580104b80d1992eddf2f2c9923f

---

## Paste this to start a new Cursor chat

```
I'm building Please.market — the X AI agent for Anyone (anyone.market).
Repo: /home/alex/Code/pronostico-pleasemarket
Read docs/HANDOFF.md first for live URLs, architecture, and what's done.

Parent product: Anyone (prediction markets on Base Sepolia, Privy, Telegram TMA).
This agent: tag @PleaseMarketBot on X → LLM parses → preview market (dry-run on Railway).

Live web: https://chiwiwis-web-production.up.railway.app
Live worker: https://chiwiwis-worker-production.up.railway.app

Stack: Python FastAPI agent (custom, no LangChain), Next.js 15, OpenAI, Postgres, Railway.
Do NOT edit pronostico (telegram/TMA) unless I ask — hackathon scope is this repo only.
Org backend (pronostico-backend please-market API) is local only, not deployed.

My next goal: [FILL IN]
```
