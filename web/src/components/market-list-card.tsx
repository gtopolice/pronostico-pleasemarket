"use client";

import Link from "next/link";
import { useState } from "react";

import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { creatorAvatarUrl, creatorHandleLabel, type MarketCreator } from "@/lib/creator-avatar";
import { getMessages, type Locale } from "@/lib/i18n";

type MarketListCardProps = MarketCreator & {
  id?: string;
  title?: string;
  lang?: string;
  isLive?: boolean;
  isDemo?: boolean;
};

export function MarketListCard({
  id,
  title,
  lang = "en",
  creator_profile_image_url,
  creator_twitter_handle,
  isLive = false,
  isDemo = true,
}: MarketListCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const creator = { creator_profile_image_url, creator_twitter_handle };
  const avatarSrc = imageFailed ? PLEASE_MARKET_LOGO_SRC : creatorAvatarUrl(creator);
  const handleLabel = creatorHandleLabel(creator);
  const t = getMessages(lang as Locale);
  const badgeLabel = isLive ? t.home.cardBadgeLive : t.home.cardBadgeDemo;
  const badgeClass = isLive ? "market-card__badge market-card__badge--live" : "market-card__badge market-card__badge--demo";

  if (!id) return null;

  return (
    <Link href={`/${lang}/market/${id}`} className="market-card">
      <div className="market-card__header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt=""
          className="market-card__avatar"
          onError={() => setImageFailed(true)}
        />
        <div className="market-card__meta">
          <div className="market-card__top">
            <h3 className="market-card__title">{title ?? "Untitled market"}</h3>
            <span className={badgeClass}>{badgeLabel}</span>
          </div>
          {handleLabel ? <p className="market-card__creator">{handleLabel}</p> : null}
        </div>
      </div>
      <div className="market-card__outcomes" aria-hidden="true">
        <div className="market-card__outcome market-card__outcome--yes">YES</div>
        <div className="market-card__outcome market-card__outcome--no">NO</div>
      </div>
    </Link>
  );
}
