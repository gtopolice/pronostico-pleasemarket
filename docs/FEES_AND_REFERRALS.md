# Fees and referrals

Chiwiwis reuses org Anyone fee model:

- Creator 50% via PMMv5/V6 `claimFeesV5`
- Ambassador 10% via `?ref=` + `POST /referral-clicks`
- Share URL: `anyone.market/{lang}/market/{doc}?ref={code}&src=chiwiwis_share`

Dashboard `/dashboard/share` generates links. `@Chiwiwis share {docId}` for power users.

Self-referral blocked by org backend on buy path.
