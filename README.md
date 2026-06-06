# Please.market

**X-native AI agent for prediction markets.** Tag [@PleaseMarketBot](https://x.com/PleaseMarketBot) with a yes/no question → the agent parses it → you link a wallet → a market goes live on [please.market](https://pleasemarket-web-production.up.railway.app/es).

Built by **[Pronóstico Labs](https://anyone.market)** for the [ETH Mexico 2026 × Bitso hackathon](https://dorahacks.io/hackathon/ethmexico2026bitso/detail) (AI × blockchain × payments). Submitted to the **Ethereum México startup** and **Bitso startup** tracks.

| | |
|---|---|
| **Web (ES)** | https://pleasemarket-web-production.up.railway.app/es |
| **Web (EN)** | https://pleasemarket-web-production.up.railway.app/en |
| **Worker API** | https://pleasemarket-worker-production.up.railway.app |
| **Demo video script** | [`docs/DEMO_VIDEO.md`](docs/DEMO_VIDEO.md) |

---

## The startup

**Pronóstico Labs** is a Mexico-founded development lab building primitives for on-chain prediction markets and crypto infrastructure. Our flagship consumer product is **[Anyone](https://anyone.market)** (▲ANYONE): the social market creation layer for what happens next.

Anyone lets anyone with a wallet **create, trade, and prove** outcomes on verifiable real-world events. Markets use a parimutuel market maker (PMM) on **Base** so they work from zero counterparty depth without operator subsidy. Creators choose a fee (up to 2%) and earn 50% of fees their market generates.

**Please.market** is not a separate company. It is a **distribution client** on top of the same Anyone protocol: shared contracts, shared liquidity, and the same Privy wallet stack. Users who arrive via X register on Please.market; trades settle through Anyone infrastructure. Think of it as Telegram is to Anyone today, X is via Please.market.

```
Pronóstico Labs
    └── Anyone (anyone.market)     ← protocol + consumer web + Telegram TMA
            └── Please.market      ← X agent + this repo (hackathon wedge)
```

Internal positioning (from our team): *Please.market can live as another client of the same stack, with contracts and liquidity crossing clients under the Anyone umbrella.*

---

## What this repo is

This repository ships the **Please.market hackathon stack** end to end:

| Piece | Role |
|-------|------|
| **Python agent** (`src/`) | X mentions → OpenAI structured parse → moderation → market deploy (or preview) |
| **FastAPI worker** | Webhooks, wallet link API, demo markets, leaderboard proxy |
| **Next.js web** (`web/`) | Bilingual `/es` + `/en` UI, Privy smart wallets, creator dashboard, market pages |

Custom Python + FastAPI. **No LangChain / agent framework.**

### User flow

1. Post on X: `@PleaseMarketBot ¿Tu pregunta de sí o no?`
2. Bot replies with a one-time **wallet link** (first time) or a **market URL** (returning creators).
3. Sign in with **Privy** + verify the same X account → embedded + smart wallet on Base Sepolia.
4. Market page goes live on please.market; creator resolves within 48h after close; traders bet in **MXNB** (hackathon demo narrative).

Example demo question (Bitso track):

> `@PleaseMarketBot ¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?`

Full recording script: [`docs/DEMO_VIDEO.md`](docs/DEMO_VIDEO.md) · Judge walkthrough: [`docs/JUDGES.md`](docs/JUDGES.md)

---

## Hackathon story (Bitso × Ethereum México)

We are an **existing startup** extending Anyone with an AI × social distribution layer, not a weekend-only repo.

| Theme | How Please.market demonstrates it |
|-------|-----------------------------------|
| **AI × blockchain** | Tweet → LLM intent → structured market object → web preview in one flow |
| **Payments / Bitso** | Demo settlement in **MXNB** (Mexican peso stablecoin on Arbitrum via Bitso Business); on-ramp story MXN → MXNB → trade |
| **Ethereum / LATAM** | Built in Mexico, bilingual product, gasless **Privy account abstraction** on Base |
| **Consumer Ethereum** | No seed phrase; market creation where people already argue (X) |

**Hackathon mode:** `PLEASE_DRY_RUN=1` stores preview markets in Postgres. Live on-chain deploy from the agent connects to our Strapi backend when enabled. Anyone’s live markets on Base Sepolia are also surfaced in the web app.

---

## Organization repos

| Repo | Role |
|------|------|
| **`pronostico-pleasemarket`** (this) | Please.market X agent, web dashboard, Railway deploy |
| [`pronostico`](https://github.com/Pronostico-Labs/pronostico-telegram) | Anyone Telegram bot + Mini App (Privy, trade alerts) |
| `pronostico-backend` | Strapi CMS: market rows, agent deploy API, wallet link, referrals |
| [anyone.market](https://anyone.market) | Consumer trading web (Base) |

Architecture detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

```
X mention → Please.market worker → pronostico-backend (Strapi) → anyone.market
                                      ↓
                            resolution-service → claims → Telegram bot
```

---

## Stack

| Layer | Tech |
|-------|------|
| Agent | Python 3, FastAPI, OpenAI SDK (structured JSON) |
| Database | PostgreSQL (mentions, wallet links, demo markets) |
| Web | Next.js 15, Privy embedded + smart wallets (ERC-4337), Base Sepolia |
| Deploy | Railway (worker + web + Postgres) |

---

## Quick start

```bash
cp .env.example .env
# Fill DATABASE_URL, OPENAI_API_KEY, PLEASE_* / X_* as needed

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
docker compose up -d postgres
python -m src.main   # worker :8080

cd web && npm install && npm run dev   # :3000
```

Simulate a mention:

```bash
curl -sS -X POST http://localhost:8080/api/x/webhook \
  -H 'Content-Type: application/json' \
  -d '{"tweet_id":"local-1","author_id":"you","author_handle":"you","text":"@PleaseMarketBot Will it rain in CDMX tomorrow?"}'
```

Env reference, Railway deploy, and known issues: [`docs/HANDOFF.md`](docs/HANDOFF.md)

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | Live URLs, env vars, deploy commands, session handoff |
| [`docs/DEMO_VIDEO.md`](docs/DEMO_VIDEO.md) | Hackathon demo video script (X-first flow) |
| [`docs/JUDGES.md`](docs/JUDGES.md) | 2-minute judge demo + elevator pitch |
| [`docs/RAILWAY.md`](docs/RAILWAY.md) | Railway service setup |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Integration with org backend and Anyone |

---

## Links

- **Anyone:** [anyone.market](https://anyone.market) · X [@anyone_market](https://x.com/ANYONE_MARKET)
- **Please.market bot:** [@PleaseMarketBot](https://x.com/PleaseMarketBot)
- **Hackathon:** [ETH Mexico 2026 × Bitso on DoraHacks](https://dorahacks.io/hackathon/ethmexico2026bitso/detail)
- **Pronóstico Labs:** builder of Anyone and Please.market

---

## License

See repository defaults. Protocol and brand assets belong to Pronóstico Labs.
