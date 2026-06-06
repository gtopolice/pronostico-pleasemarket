# Fees and referrals

Please.market reuses org Anyone fee model:

- Creator 50% via PMMv5/V6 `claimFeesV5`
- Ambassador 10% via `?ref=` + `POST /referral-clicks`
- Share URL: `anyone.market/{lang}/market/{doc}?ref={code}&src=please_market_share`

Dashboard `/dashboard/share` generates links. `@PleaseMarket share {docId}` for power users.

Self-referral blocked by org backend on buy path.
