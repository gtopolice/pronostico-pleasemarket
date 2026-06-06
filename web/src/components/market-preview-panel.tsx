"use client";

import { useMemo, useState } from "react";

import { MarketPreviewChart } from "@/components/market-preview-chart";
import { MarketPreviewCheckout } from "@/components/market-preview-checkout";
import { getMessages, type Locale } from "@/lib/i18n";
import { fakeChartPoints, fakeMarketStats, formatUsd } from "@/lib/fake-market-data";

type MarketPreviewPanelProps = {
  marketId: string;
  title: string;
  closeTimeUtc?: string | null;
  isPreview: boolean;
  locale?: Locale;
};

export function MarketPreviewPanel({
  marketId,
  title,
  closeTimeUtc,
  isPreview,
  locale = "es",
}: MarketPreviewPanelProps) {
  const [selectedShare, setSelectedShare] = useState<"YES" | "NO">("YES");
  const stats = useMemo(() => fakeMarketStats(marketId), [marketId]);
  const chartData = useMemo(
    () => fakeChartPoints(marketId, selectedShare),
    [marketId, selectedShare],
  );
  const probability = selectedShare === "YES" ? stats.probability : 1 - stats.probability;
  const t = getMessages(locale);

  return (
    <div className="market-preview-panel">
      <div className="market-preview-panel__volume">
        <span>{t.market.volume}</span>
        <strong>{formatUsd(stats.volumeUsdc, 0)}</strong>
      </div>

      <div className="market-detail-layout__body">
        <MarketPreviewChart
          data={chartData}
          probability={probability}
          selectedShare={selectedShare}
          onToggleShare={() => setSelectedShare((value) => (value === "YES" ? "NO" : "YES"))}
        />
        <MarketPreviewCheckout
          marketId={marketId}
          title={title}
          closeTimeUtc={closeTimeUtc}
          isPreview={isPreview}
          locale={locale}
        />
      </div>
    </div>
  );
}
