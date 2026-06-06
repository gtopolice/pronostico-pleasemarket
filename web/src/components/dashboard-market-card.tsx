"use client";

import Link from "next/link";
import { useState } from "react";

import { CreatorStatsGrid } from "@/components/creator-stats-grid";
import { RulesAccordion } from "@/components/rules-accordion";
import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { creatorAvatarUrl, creatorHandleLabel, type MarketCreator } from "@/lib/creator-avatar";
import {
  dummyMarketStats,
  formatCloseTime,
  marketRules,
  marketStatus,
  marketStatusLabel,
  type MarketRow,
} from "@/lib/market-display";

type DashboardMarketCardProps = MarketRow & MarketCreator & {
  lang?: string;
};

function statusBadgeClass(status: ReturnType<typeof marketStatus>): string {
  if (status === "open") return "badge badge--live";
  if (status === "resolved") return "badge badge--preview";
  return "badge badge--closed";
}

export function DashboardMarketCard({
  documentId,
  title,
  question,
  state,
  close_time_utc,
  resolution_rules,
  description,
  lang = "en",
  creator_profile_image_url,
  creator_twitter_handle,
}: DashboardMarketCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!documentId) return null;

  const creator = { creator_profile_image_url, creator_twitter_handle };
  const avatarSrc = imageFailed ? PLEASE_MARKET_LOGO_SRC : creatorAvatarUrl(creator);
  const handleLabel = creatorHandleLabel(creator);
  const status = marketStatus({ state, close_time_utc });
  const stats = dummyMarketStats(documentId);
  const rules = marketRules({ resolution_rules, description });
  const displayTitle = title ?? question ?? "Untitled market";

  return (
    <article className="dashboard-market-card card">
      <div className="dashboard-market-card__header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt=""
          className="dashboard-market-card__avatar"
          onError={() => setImageFailed(true)}
        />
        <div className="dashboard-market-card__intro">
          <div className="dashboard-market-card__title-row">
            <h3 className="dashboard-market-card__title">
              <Link href={`/${lang}/market/${documentId}`}>{displayTitle}</Link>
            </h3>
            <span className={statusBadgeClass(status)}>{marketStatusLabel(status)}</span>
          </div>
          {handleLabel ? <p className="dashboard-market-card__creator">{handleLabel}</p> : null}
          <p className="dashboard-market-card__close">
            <span>Closes</span> {formatCloseTime(close_time_utc)}
          </p>
        </div>
      </div>

      <CreatorStatsGrid stats={stats} />

      <RulesAccordion rules={rules} />
    </article>
  );
}
