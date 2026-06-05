# Chiwiwis architecture

Chiwiwis is Anyone's X-native market creation layer. It plugs into existing infra:

```
X mention → Chiwiwis worker → pronostico-backend (Strapi) → anyone.market
                                      ↓
                            resolution-service → /claims → Telegram bot
```

## Components

| Component | Repo | Role |
|-----------|------|------|
| Agent worker | `pronostico-chiwiwis` | Webhook, LLM, moderation, X replies |
| BFF | `pronostico-chiwiwis/src/api` | Leaderboard proxy, short links |
| Dashboard | `pronostico-chiwiwis/web` | Privy auth, resolve queue, share tab |
| Backend | `pronostico-backend` @ feat/testnet | Deploy API, wallet link, referrals |
| Consumer web | anyone.market | Trading |

## Deploy flow

1. User tags @Chiwiwis with market prompt
2. Worker checks wallet link (`GET /agent/chiwiwis/wallet/:id`)
3. LLM parses intent → moderation → `POST /agent/chiwiwis/markets/deploy`
4. Agent treasury completes on-chain steps (org signing endpoints)
5. Reply with anyone.market link + creator resolve duty

## Resolution ladder

1. Creator via dashboard (`resolveViaOracle`)
2. Org resolution-service escalation after SLA
3. Admin break-glass via pronostico-apps/admin
