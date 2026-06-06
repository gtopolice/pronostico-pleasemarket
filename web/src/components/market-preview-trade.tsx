"use client";

import { useMemo, useState } from "react";

import { formatUsd } from "@/lib/fake-market-data";

type MarketPreviewTradeProps = {
  priceYes: number;
  priceNo: number;
  isPreview: boolean;
};

const BUY_AMOUNTS = [1, 5, 10, 20, 100];

export function MarketPreviewTrade({ priceYes, priceNo, isPreview }: MarketPreviewTradeProps) {
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [buyYes, setBuyYes] = useState(true);
  const [amount, setAmount] = useState(10);

  const activePrice = buyYes ? priceYes : priceNo;
  const shares = amount > 0 ? amount / activePrice : 0;
  const potentialWin = shares;
  const avgPrice = activePrice;
  const roi = amount > 0 ? potentialWin / amount : 0;
  const balance = 250;

  const amountLabel = useMemo(() => {
    if (selectedTab === "sell") return "Shares";
    return "Amount";
  }, [selectedTab]);

  return (
    <div className="preview-trade">
      <div className="preview-trade__tabs" role="tablist" aria-label="Trade mode">
        <button
          type="button"
          role="tab"
          aria-selected={selectedTab === "buy"}
          className={`preview-trade__tab${selectedTab === "buy" ? " preview-trade__tab--active" : ""}`}
          onClick={() => setSelectedTab("buy")}
        >
          Buy
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTab === "sell"}
          className={`preview-trade__tab${selectedTab === "sell" ? " preview-trade__tab--active" : ""}`}
          onClick={() => setSelectedTab("sell")}
        >
          Sell
        </button>
      </div>

      <div className="preview-trade__outcomes">
        <button
          type="button"
          className={`preview-trade__outcome preview-trade__outcome--yes${buyYes ? " preview-trade__outcome--active" : ""}`}
          onClick={() => setBuyYes(true)}
        >
          Yes {(priceYes * 100).toFixed(0)}¢
        </button>
        <button
          type="button"
          className={`preview-trade__outcome preview-trade__outcome--no${!buyYes ? " preview-trade__outcome--active" : ""}`}
          onClick={() => setBuyYes(false)}
        >
          No {(priceNo * 100).toFixed(0)}¢
        </button>
      </div>

      <div className="preview-trade__amount-row">
        <div>
          <div className="preview-trade__amount-label">{amountLabel}</div>
          {selectedTab === "buy" ? (
            <div className="preview-trade__balance">Balance: ${formatUsd(balance)}</div>
          ) : (
            <div className="preview-trade__balance">&nbsp;</div>
          )}
        </div>
        <div className="preview-trade__amount-input-wrap">
          {selectedTab === "buy" ? <span className="preview-trade__currency">$</span> : null}
          <input
            className="preview-trade__amount-input"
            type="number"
            min={0}
            step={selectedTab === "buy" ? 1 : 1}
            value={amount}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isNaN(next) && next >= 0) setAmount(next);
            }}
          />
        </div>
      </div>

      {selectedTab === "buy" ? (
        <div className="preview-trade__quick-amounts">
          {BUY_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              className="preview-trade__quick-amount"
              onClick={() => setAmount(value)}
            >
              ${value}
            </button>
          ))}
        </div>
      ) : null}

      {amount > 0 ? (
        <div className="preview-trade__summary">
          <div className="preview-trade__summary-row">
            <span>{selectedTab === "buy" ? "Potential win" : "You will receive"}</span>
            <strong>${formatUsd(selectedTab === "buy" ? potentialWin : amount * activePrice)}</strong>
          </div>
        </div>
      ) : null}

      <div className="preview-trade__stats">
        <div className="preview-trade__stat">
          <span>Avg price</span>
          <strong>${formatUsd(avgPrice)}</strong>
        </div>
        <div className="preview-trade__stat">
          <span>Shares</span>
          <strong>{shares > 0 ? shares.toFixed(0) : "0"}</strong>
        </div>
        <div className="preview-trade__stat">
          <span>ROI pot.</span>
          <strong className="preview-trade__roi">{roi.toFixed(2)}x</strong>
        </div>
      </div>

      <button type="button" className="preview-trade__submit" disabled>
        {isPreview
          ? "Preview only — dry run"
          : buyYes
            ? selectedTab === "buy"
              ? "Buy Yes"
              : "Sell Yes"
            : selectedTab === "buy"
              ? "Buy No"
              : "Sell No"}
      </button>
    </div>
  );
}
