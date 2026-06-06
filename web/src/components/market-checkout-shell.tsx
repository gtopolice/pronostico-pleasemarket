"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckoutCard } from "../../vendor/pronostico-apps/packages/ui/cards/checkout-card/checkout-card";
import { useMarketTrading } from "../../vendor/pronostico-apps/packages/prediction-market/hooks/useMarketTrading";
import { Market, MarketType, State } from "@pronostico-apps/interfaces";

import { formatTradeSubmitError } from "@/lib/format-trade-error";
import { getMessages, type Locale } from "@/lib/i18n";
import type { MarketOption } from "@/lib/market-option";
import { txExplorerUrl } from "@/lib/tx-explorer";
import { usePrivySigner } from "@/hooks/use-privy-signer";

type MarketCheckoutShellProps = {
  market: MarketOption;
  locale?: Locale;
};

function synthesizeMarket(option: MarketOption): Market {
  const versionRaw = (option.contractVersion ?? "V4").toUpperCase();
  const version =
    versionRaw === "V1" || versionRaw === "V2" || versionRaw === "V3" || versionRaw === "V4"
      ? (versionRaw as "V1" | "V2" | "V3" | "V4")
      : "V4";
  const stateUpper = (option.state ?? "PUBLISHED").toUpperCase();
  const state = (Object.values(State) as string[]).includes(stateUpper)
    ? (stateUpper as State)
    : State.PUBLISHED;

  return {
    id: option.id,
    documentId: option.documentId ?? "",
    market_id: String(option.cpmmMarketId),
    title: option.title,
    question: null,
    description: null,
    market_type: MarketType.BINARY,
    image_url: option.imageUrl ?? null,
    region: null,
    sub_region: null,
    language: null,
    open_time_utc: null,
    close_time_utc: option.closeTimeUtc ?? null,
    resolution_time_utc: null,
    resolution_rules: null,
    sources: null,
    resolution_method: null,
    on_ambiguity: null,
    visibility: null,
    state,
    internal_notes: null,
    createdAt: "",
    updatedAt: "",
    publishedAt: null,
    country: null,
    tags: null,
    category: null,
    tag: null,
    pool_address: option.poolAddress,
    condition_id: null,
    yes_token_id: null,
    no_token_id: null,
    usdc_address: null,
    cpmm_address: option.tradingContractAddress,
    cpmm_market_id: String(option.cpmmMarketId),
    payment_schedule: null,
    volume: null,
    is_marked: false,
    resolution_result: null,
    image: null,
    contract_version: version,
    highlighted: null,
    why_choose_no: null,
    why_choose_yes: null,
    creator_wallet: null,
    creator: null,
    liquidity_status: "added",
    liquidity_provider: null,
    chart: null,
    type: "BINARY",
    is_seen: true,
  } as Market;
}

export function MarketCheckoutShell({ market, locale = "es" }: MarketCheckoutShellProps) {
  const t = getMessages(locale);
  const { authenticated, login, ready } = usePrivy();
  const { signer, provider, isLoading: signerLoading } = usePrivySigner();

  const [selectedTab, setSelectedTab] = useState(1);
  const [buyYes, setBuyYes] = useState(true);
  const [amount, setAmount] = useState(5);
  const [debouncedAmount, setDebouncedAmount] = useState(5);
  const [tokenAmount, setTokenAmount] = useState("0");
  const [estCost, setEstCost] = useState("0.00");
  const [potentialWin, setPotentialWin] = useState("0.00");
  const [isCalculating, setIsCalculating] = useState(false);
  const [shouldFetchLiveStats, setShouldFetchLiveStats] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);

  const synthMarket = useMemo(() => synthesizeMarket(market), [market]);
  const cpmmMarketId = useMemo(() => BigInt(market.cpmmMarketId), [market.cpmmMarketId]);
  const isCpmm = market.contractVersion === "V3" || market.contractVersion === "V4";

  useEffect(() => {
    const timer = window.setTimeout(() => setShouldFetchLiveStats(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedAmount(amount), 500);
    return () => window.clearTimeout(timer);
  }, [amount]);

  const {
    buyTokens,
    calculateCost,
    calculateAmountForBudget,
    calculatePotentialWin,
    isLoading,
    balances,
    stats,
  } = useMarketTrading({
    poolAddress: synthMarket.pool_address,
    conditionId: synthMarket.condition_id,
    yesTokenId: synthMarket.yes_token_id,
    noTokenId: synthMarket.no_token_id,
    title: synthMarket.title,
    signer: signer || undefined,
    provider: provider || undefined,
    enabled: shouldFetchLiveStats && authenticated,
    contractVersion: (synthMarket.contract_version as "V3" | "V4") || "V4",
    cpmmAddress: synthMarket.cpmm_address,
    cpmmMarketId,
  });

  const calcRef = useRef({ calculateAmountForBudget, calculateCost, calculatePotentialWin });

  useEffect(() => {
    calcRef.current = { calculateAmountForBudget, calculateCost, calculatePotentialWin };
  }, [calculateAmountForBudget, calculateCost, calculatePotentialWin]);

  useEffect(() => {
    let isCurrent = true;
    const updateEstimates = async () => {
      if (!authenticated || !signer) {
        if (isCurrent) {
          setTokenAmount("0");
          setEstCost("0.00");
          setPotentialWin("0.00");
        }
        return;
      }

      setIsCalculating(true);
      try {
        const outcome = buyYes ? "yes" : "no";
        const { calculateAmountForBudget: calcBudget, calculateCost: calcCost, calculatePotentialWin: calcWin } =
          calcRef.current;

        if (debouncedAmount < 1) {
          if (isCurrent) {
            setTokenAmount("0");
            setEstCost("0.00");
            setPotentialWin("0.00");
          }
          return;
        }

        const tAmount = await calcBudget(outcome, debouncedAmount.toString());
        const cost = await calcCost(outcome, tAmount);

        if (isCpmm && calcWin && debouncedAmount > 0) {
          const win = await calcWin(outcome, debouncedAmount.toString());
          if (isCurrent) setPotentialWin(win);
        } else if (isCurrent) {
          setPotentialWin("0.00");
        }

        if (!isCurrent) return;
        setTokenAmount(tAmount);
        setEstCost(cost);
      } finally {
        if (isCurrent) setIsCalculating(false);
      }
    };

    void updateEstimates();
    return () => {
      isCurrent = false;
    };
  }, [authenticated, buyYes, debouncedAmount, isCpmm, signer]);

  const handleTrade = async () => {
    setSubmitError(null);
    setSuccessHash(null);

    if (!ready || !authenticated || !signer) {
      login();
      return;
    }

    try {
      const outcome = buyYes ? "yes" : "no";
      let finalTokenAmount = tokenAmount;
      let finalEstCost = estCost;

      if (selectedTab === 1 && parseFloat(estCost) < 1.0) {
        const adjusted =
          Math.ceil(
            parseFloat(debouncedAmount.toString()) * (1.0 / Math.max(parseFloat(estCost), 0.000001)) * 100 + 5,
          ) / 100;
        finalTokenAmount = await calcRef.current.calculateAmountForBudget(outcome, adjusted.toString());
        finalEstCost = adjusted.toString();
      }

      const txHash = await buyTokens(outcome, finalTokenAmount, finalEstCost);
      setSuccessHash(txHash);
      setAmount(5);
      window.setTimeout(() => setSuccessHash((prev) => (prev === txHash ? null : prev)), 8000);
    } catch (err) {
      setSubmitError(formatTradeSubmitError(err));
    }
  };

  const labels = {
    amount: t.market.amount,
    balance: t.market.balance,
    buy: t.market.buy,
    sell: t.market.sell,
    yes: t.market.yes,
    no: t.market.no,
    max: t.market.max,
    profit: t.market.potentialWin,
    youWillReceive: t.market.potentialWin,
    predicting: t.market.tradeLive,
    buyYes: t.market.buyYes,
    buyNo: t.market.buyNo,
    sellYes: t.market.sell,
    sellNo: t.market.sell,
    insufficientShares: t.market.balance,
    insufficientBalance: t.market.insufficientBalanceLive,
    shares: t.market.amount,
    avgPrice: t.market.amount,
    roiActual: t.market.potentialWin,
    roiPot: t.market.potentialWin,
  };

  return (
    <div className="market-checkout-shell">
      <CheckoutCard
        market={synthMarket}
        signer={signer || undefined}
        provider={provider || undefined}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        buyYes={buyYes}
        setBuyYes={setBuyYes}
        amount={amount}
        setAmount={setAmount}
        tokenAmount={tokenAmount}
        estCost={estCost}
        balances={{
          usdc: String(balances.usdc),
          yes: Number(balances.yes),
          no: Number(balances.no),
        }}
        stats={stats}
        isLoading={isLoading || isCalculating || signerLoading || !ready}
        onTrade={handleTrade}
        hideSellTab
        potentialWin={isCpmm ? potentialWin : undefined}
        labels={labels}
      />

      {!authenticated ? (
        <p className="market-checkout-shell__hint">{t.market.signInToTrade}</p>
      ) : null}

      {submitError ? <p className="market-checkout-shell__error">{submitError}</p> : null}

      {successHash ? (
        <p className="market-checkout-shell__success">
          {t.market.tradeSuccess}{" "}
          <a href={txExplorerUrl(successHash)} target="_blank" rel="noreferrer">
            {t.market.viewTx}
          </a>
        </p>
      ) : null}
    </div>
  );
}
