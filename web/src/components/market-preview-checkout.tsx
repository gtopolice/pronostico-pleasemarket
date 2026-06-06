"use client";

import { CheckoutCard } from "../../vendor/pronostico-apps/packages/ui/cards/checkout-card/checkout-card";
import { Market, MarketType, State } from "@pronostico-apps/interfaces";
import { useEffect, useMemo, useState } from "react";

import { fakeMarketStats } from "@/lib/fake-market-data";

type MarketPreviewCheckoutProps = {
  marketId: string;
  title: string;
  closeTimeUtc?: string | null;
  isPreview: boolean;
};

export function MarketPreviewCheckout({
  marketId,
  title,
  closeTimeUtc,
  isPreview,
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
      balances={{ usdc: "250", yes: 0, no: 0 }}
      stats={{ priceYes, priceNo }}
      isLoading
      hideSellTab
      potentialWin={potentialWin}
      onTrade={async () => {}}
      labels={{
        amount: "Amount",
        balance: "Balance",
        buy: "Buy",
        sell: "Sell",
        yes: "Yes",
        no: "No",
        max: "Max",
        profit: "Potential win",
        youWillReceive: "You will receive",
        predicting: isPreview ? "Preview only — dry run" : "Trade on Anyone",
        buyYes: "Buy Yes",
        buyNo: "Buy No",
        sellYes: "Sell Yes",
        sellNo: "Sell No",
        insufficientShares: "Insufficient shares",
        insufficientBalance: "Insufficient balance",
        shares: "Shares",
        avgPrice: "Avg price",
        roiActual: "ROI actual",
        roiPot: "ROI pot.",
      }}
    />
  );
}
