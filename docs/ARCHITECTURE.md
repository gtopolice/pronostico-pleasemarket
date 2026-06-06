# Please.market architecture

Please.market is Anyone's X-native market creation layer. It plugs into existing infra:

```
X mention → Please.market worker → pronostico-backend (Strapi) → anyone.market
                                      ↓
                            resolution-service → /claims → Telegram bot
```

## Components

| Component | Repo | Role |
|-----------|------|------|
| Agent worker | `pronostico-pleasemarket` | Webhook, LLM, moderation, X replies |
| BFF | `pronostico-pleasemarket/src/api` | Leaderboard proxy, short links |
| Dashboard | `pronostico-pleasemarket/web` | Privy auth, resolve queue, share tab |
| Backend | `pronostico-backend` @ feat/testnet | Deploy API, wallet link, referrals |
| Consumer web | anyone.market | Trading |

## Deploy flow

1. User tags @PleaseMarketBot with market prompt
2. Worker checks wallet link (`GET /agent/please-market/wallet/:id`)
3. LLM parses intent → moderation → `POST /agent/please-market/markets/deploy`
4. Agent treasury completes on-chain steps (org signing endpoints)
5. Reply with anyone.market link + creator resolve duty

## Resolution ladder

1. Creator via dashboard (`resolveViaOracle`)
2. Org resolution-service escalation after SLA
3. Admin break-glass via pronostico-apps/admin
