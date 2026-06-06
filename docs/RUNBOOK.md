# Please.market operations runbook

## Pause agent

Set `PLEASE_GLOBAL_KILL_SWITCH=1` or `AGENT_DEPLOY_ENABLED=0` on Railway. Worker continues health checks; deploy replies stop.

## Treasury top-up

Agent treasury wallet needs USDC for seed liquidity on instant deploy. Monitor balance; top up from ops wallet when below threshold (configure alert in Railway).

## Replay failed mentions

1. Delete row from `processed_mentions` where `tweet_id = ...`
2. POST mention payload to `/api/x/webhook` or wait for X redelivery

## Moderation escalation

Illegal/spam → auto-reject + `audit_log`. Edge cases → `#please-market-ops` Slack, manual `creator_reputation.tier = restricted`.

## Org escalation path

Overdue resolve → verify `resolve_obligations.status = platform_escalation` → ops queue in admin panel → resolution-service indexing.

## Mainnet soft launch

1. Testnet E2E: tag → deploy → trade → resolve → claim
2. Remove allowlist (`PLEASE_DEPLOY_ALLOWLIST` empty)
3. Set `PLEASE_DRY_RUN=0`, `AGENT_DEPLOY_ENABLED=1`
4. Switch @PleaseMarket to production X app credentials
5. CEO sign-off on permissionless deploy policy
