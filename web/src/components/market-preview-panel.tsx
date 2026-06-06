"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { MarketPreviewChart } from "@/components/market-preview-chart";
import { MarketPreviewCheckout } from "@/components/market-preview-checkout";
import { getMessages, type Locale } from "@/lib/i18n";
import { fakeChartPoints, fakeMarketStats, formatUsd } from "@/lib/fake-market-data";
import type { MarketOption } from "@/lib/market-option";

const MarketCheckoutShell = dynamic(
  () => import("@/components/market-checkout-shell").then((mod) => mod.MarketCheckoutShell),
  { ssr: false },
);

type MarketPreviewPanelProps = {
  marketId: string;
  title: string;
  closeTimeUtc?: string | null;
  isPreview: boolean;
  liveMarket?: MarketOption | null;
  volumeDisplay?: string | null;
  locale?: Locale;
};

export function MarketPreviewPanel({
  marketId,
  title,
  closeTimeUtc,
  isPreview,
  liveMarket = null,
  volumeDisplay = null,
  locale = "es",
}: MarketPreviewPanelProps) {
  const [selectedShare, setSelectedShare] = useState<"YES" | "NO">("YES");
  const stats = useMemo(() => fakeMarketStats(marketId), [marketId]);
  const chartData = useMemo(
    () => fakeChartPoints(marketId, selectedShare),
    [marketId, selectedShare],
  );
  const probability =
    liveMarket?.probabilityYes != null && selectedShare === "YES"
      ? liveMarket.probabilityYes / 100
      : liveMarket?.probabilityNo != null && selectedShare === "NO"
        ? liveMarket.probabilityNo / 100
        : selectedShare === "YES"
          ? stats.probability
          : 1 - stats.probability;
  const t = getMessages(locale);
  const volumeLabel = volumeDisplay ?? formatUsd(stats.volumeUsdc, 0);

  return (
    <div className="market-preview-panel">
      <div className="market-preview-panel__volume">
        <span>{t.market.volume}</span>
        <strong>{volumeLabel}</strong>
      </div>

      <div className="market-detail-layout__body">
        <MarketPreviewChart
          data={chartData}
          probability={probability}
          selectedShare={selectedShare}
          onToggleShare={() => setSelectedShare((value) => (value === "YES" ? "NO" : "YES"))}
        />
        {liveMarket ? (
          <MarketCheckoutShell market={liveMarket} locale={locale} />
        ) : (
          <MarketPreviewCheckout
            marketId={marketId}
            title={title}
            closeTimeUtc={closeTimeUtc}
            isPreview={isPreview}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
