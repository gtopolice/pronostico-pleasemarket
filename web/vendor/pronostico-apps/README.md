# Vendored packages from pronostico-apps

Snapshot of org UI packages used by the Please.market web app.

**Source:** `/pronostico-apps/packages/` (Anyone / Pronóstico Labs monorepo)

**Used for:** `CheckoutCard` on market preview pages

**To refresh from org repo:**

```bash
cp -r ../../pronostico-apps/packages/{ui,interfaces,prediction-market,common,theme-css} web/vendor/pronostico-apps/packages/
```

Then re-apply patches in `ui/cards/checkout-card/checkout-card.tsx` if the org file changed:
- `AmountInput` → relative import from `../../inputs/amount-input`
- `formatNumber` → `../../../prediction-market/utils/format`
- `Market` → `../../../interfaces/markets`
