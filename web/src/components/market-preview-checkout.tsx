"use client";

import { CheckoutCard } from "../../vendor/pronostico-apps/packages/ui/cards/checkout-card/checkout-card";
import { Market, MarketType, State } from "@pronostico-apps/interfaces";
import { useEffect, useMemo, useState } from "react";

import { DEMO_STABLECOIN } from "@/lib/demo-currency";
import { fakeMarketStats } from "@/lib/fake-market-data";
import { getMessages, type Locale } from "@/lib/i18n";

type MarketPreviewCheckoutProps = {
  marketId: string;
  title: string;
  closeTimeUtc?: string | null;
  isPreview: boolean;
  locale?: Locale;
};

export function MarketPreviewCheckout({
  marketId,
  title,
  closeTimeUtc,
  isPreview,
  locale = "es",
}: MarketPreviewCheckoutProps) {
  const [selectedTab, setSelectedTab] = useState(1);
  const [buyYes, setBuyYes] = useState(true);
  const [amount, setAmount] = useState(10);
  const [tokenAmount, setTokenAmount] = useState("0");
  const [estCost, setEstCost] = useState("0.00");
  const [potentialWin, setPotentialWin] = useState("0.00");

  const demoStats = useMemo(() => fakeMarketStats(marketId), [marketId]);
  const priceYes = demoStats.priceYes;
  const priceNo = demoStats.priceNo;
  const t = getMessages(locale);

  const market = useMemo(
    (): Market =>
      ({
        id: 0,
        documentId: marketId,
        market_id: marketId,
        title,
        question: title,
        description: null,
        market_type: MarketType.BINARY,
        image_url: null,
        region: null,
        sub_region: null,
        language: null,
        open_time_utc: null,
        close_time_utc: closeTimeUtc ?? null,
        resolution_time_utc: null,
        resolution_rules: null,
        sources: null,
        resolution_method: null,
        on_ambiguity: null,
        visibility: null,
        state: State.PUBLISHED,
        internal_notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        country: null,
        contract_version: "V3",
        resolution_result: null,
        liquidity_status: "added",
        type: "binary",
      }) as Market,
    [closeTimeUtc, marketId, title],
  );

  useEffect(() => {
    if (selectedTab === 1 && amount < 1) {
      setTokenAmount("0");
      setEstCost("0.00");
      setPotentialWin("0.00");
      return;
    }

    if (amount <= 0) {
      setTokenAmount("0");
      setEstCost("0.00");
      setPotentialWin("0.00");
      return;
    }

    const activePrice = buyYes ? priceYes : priceNo;
    const shares = amount / activePrice;
    setTokenAmount(shares.toFixed(0));
    setEstCost(amount.toFixed(2));
    setPotentialWin(shares.toFixed(2));
  }, [amount, buyYes, priceNo, priceYes, selectedTab]);

  return (
    <CheckoutCard
      market={market}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      buyYes={buyYes}
      setBuyYes={setBuyYes}
      amount={amount}
      setAmount={setAmount}
      tokenAmount={tokenAmount}
      estCost={estCost}
      demoCurrency={DEMO_STABLECOIN}
      balances={{ usdc: "2500", yes: 0, no: 0 }}
      stats={{ priceYes, priceNo }}
      isLoading
      hideSellTab
      potentialWin={potentialWin}
      onTrade={async () => {}}
      labels={{
        amount: t.market.amount,
        balance: t.market.balance,
        buy: t.market.buy,
        sell: t.market.sell,
        yes: t.market.yes,
        no: t.market.no,
        max: t.market.max,
        profit: t.market.potentialWin,
        youWillReceive: t.market.potentialWin,
        predicting: isPreview ? t.market.previewTrade : t.market.tradeOnAnyone,
        buyYes: t.market.buyYes,
        buyNo: t.market.buyNo,
        sellYes: t.market.sell,
        sellNo: t.market.sell,
        insufficientShares: t.market.balance,
        insufficientBalance: t.market.insufficientBalance,
        shares: t.market.amount,
        avgPrice: t.market.amount,
        roiActual: t.market.potentialWin,
        roiPot: t.market.potentialWin,
      }}
    />
  );
}
