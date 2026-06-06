# Please.market — judge demo guide

Live web: https://pleasemarket-web-production.up.railway.app  
Live worker: https://pleasemarket-worker-production.up.railway.app  

**Spanish demo (default):** https://pleasemarket-web-production.up.railway.app/es  
**English:** https://pleasemarket-web-production.up.railway.app/en  

Tracks: **Ethereum México startup** + **Bitso startup** @ [ETH Mexico 2026 × Bitso](https://dorahacks.io/hackathon/ethmexico2026bitso/detail)

---

## Elevator pitch (30 s)

> **Anyone** (anyone.market) ya opera mercados de predicción en Base. **Please.market** es la capa en X: mencionas a `@PleaseMarketBot` con una pregunta de sí o no → la IA la convierte en mercado → tú resuelves, la gente apuesta. Demo en **MXNB** (Bitso en Arbitrum), billeteras **Privy** sin gas, sin frase semilla. Startup mexicana para los tracks **Ethereum México** y **Bitso**.

**Payments story:** Demo en MXNB sobre Arbitrum vía Bitso Business. On-ramp: MXN → MXNB → operar.

Video script (X-first flow): `docs/DEMO_VIDEO.md`

---

## 2-minute demo script (Español)

Flujo completo en `docs/DEMO_VIDEO.md`. Resumen:

1. **X** — desde tu perfil, publica: `@PleaseMarketBot ¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?`
2. **Bot** — responde con enlace `/link-x` (primera vez) o enlace directo al mercado
3. **Privy** — inicia sesión con X, vincula billetera, mercado se publica
4. Abre **`/es/market/{id}`** — gráfica, panel de trade MXNB, badge preview hackathon
5. **Panel** (`/es/dashboard`) — mercados, ganancias demo, claim
6. *(Opcional)* Homepage `/es` — strip hackathon ETH Mexico × Bitso

**Fallback sin bot en vivo:**

```bash
curl -sS -X POST https://pleasemarket-worker-production.up.railway.app/api/x/webhook \
  -H 'Content-Type: application/json' \
  -d '{"tweet_id":"demo-'$(date +%s)'","author_id":"you123","author_handle":"you","text":"@PleaseMarketBot ¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?"}'
```

---

## 2-minute demo script (English)

Same flow at `/en` with English UI and tweet: `@PleaseMarketBot Will a MXNB payments project win the Bitso startup track at ETH Mexico 2026?`

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
- [ ] 2–3 min demo video — script X-first en `docs/DEMO_VIDEO.md`
- [ ] DoraHacks BUIDL + Skool tracks

See `docs/HANDOFF.md` for env vars and Railway deploy.
