# Please.market — judge demo guide

Live web: https://pleasemarket-web-production.up.railway.app  
Live worker: https://pleasemarket-worker-production.up.railway.app  

**Spanish demo (default):** https://pleasemarket-web-production.up.railway.app/es  
**English:** https://pleasemarket-web-production.up.railway.app/en  

Tracks: **Ethereum México startup** + **Bitso startup** @ [ETH Mexico 2026 × Bitso](https://dorahacks.io/hackathon/ethmexico2026bitso/detail)

---

## Elevator pitch (30 s)

> **Anyone** (anyone.market) runs prediction markets on Base. **Please.market** is the X distribution layer: tag `@PleaseMarketBot` → AI parses → preview market → creator resolves. **Demo settlement currency: MXNB** (Bitso on Arbitrum). Gasless Privy smart wallets, no seed phrase. Built in Mexico for LATAM.

**Payments story:** Demo markets in MXNB on Arbitrum via Bitso Business. On-ramp: MXN → MXNB → trade.

---

## 2-minute demo script (Español)

1. Abre **https://pleasemarket-web-production.up.railway.app/es** — strip hackathon ETH Mexico × Bitso, stack Base · Privy · MXNB · OpenAI.
2. Mercados seed en español (ETH Mexico, Bitso, Base).
3. Abre un mercado → gráfica, panel de trade, badge **Preview hackathon · deploy onchain próximamente**.
4. **Crear en X** — tweet de ejemplo: `@PleaseMarketBot ¿Se agotará ETH Mexico antes del domingo?`
5. Simula webhook (o mención real si el bot está activo):

```bash
curl -sS -X POST https://pleasemarket-worker-production.up.railway.app/api/x/webhook \
  -H 'Content-Type: application/json' \
  -d '{"tweet_id":"demo-'$(date +%s)'","author_id":"you123","author_handle":"you","text":"@PleaseMarketBot ¿Se agotará ETH Mexico antes del domingo?"}'
```

6. Bot responde en español con enlace `/es/market/{id}`.
7. **Panel** (`/es/dashboard`) — Privy, ganancias demo, claim.

---

## 2-minute demo script (English)

Same flow at `/en` with English UI and tweet: `@PleaseMarketBot Will ETH Mexico sell out before Sunday?`

---

## Stack (for judges)

| Layer | Tech |
|-------|------|
| Agent | Custom Python FastAPI (no LangChain) |
| LLM | OpenAI structured JSON |
| Chain | Base Sepolia (Privy) · demo settlement **MXNB** on Arbitrum |
| Wallets | Privy embedded + smart wallets (ERC-4337) |
| Web | Next.js 15, bilingual `/en` + `/es` |
| Deploy | Railway worker + web + Postgres |

---

## Submission checklist

- [x] Public GitHub
- [ ] 2–3 min demo video (use script above)
- [ ] DoraHacks BUIDL + Skool tracks

See `docs/HANDOFF.md` for env vars and Railway deploy.
