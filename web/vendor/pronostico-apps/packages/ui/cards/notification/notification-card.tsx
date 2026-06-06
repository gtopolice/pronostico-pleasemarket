"use client";

import { Notification } from "@pronostico-apps/interfaces";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import "dayjs/locale/en";
import "dayjs/locale/pt";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

dayjs.extend(relativeTime);

interface NotificationCardProps extends Omit<Notification, "locale"> {
    dayjsLocale?: string;
}

export function NotificationCard({ notification, createdAt, is_read, dayjsLocale = "es" }: NotificationCardProps) {
    // Update dayjs locale when prop changes
    useEffect(() => {
        dayjs.locale(dayjsLocale);
    }, [dayjsLocale]);

    // Extract data from nested notification object
    const { title, message, market, localeData } = notification ?? {};

    const router = useRouter();
    const len = 37;

    const renderTitle = (title: string) => {
        if (title.length > len) {
            const truncated = title.slice(0, len);
            return title.endsWith("?") ? `${truncated}...?` : `${truncated}...`;
        }
        return title;
    }

    const redirect = () => {
        if (market?.documentId) {
            router.push(`/${dayjsLocale}/market/${market.documentId}`);
        }
        return;
    }

    // Use localeData from API if available (new behavior)
    // Otherwise fall back to existing title/message/market fields (backward compatibility)
    const notificationTitle = localeData?.title || title || market?.title || "";
    const notificationMessage = localeData?.message || message || market?.description || "";
    const marketTitleForDisplay = localeData?.marketTitle || market?.title || "";

    return (
        <div
            onClick={redirect}
            className={`flex w-full flex-row items-center justify-between px-4 py-2 h-[70px] border-b border-[var(--outline-variant)] transition-colors hover:bg-[var(--surface-container-high)] cursor-pointer ${!is_read ? "bg-[var(--surface-container-low)]" : ""}`}
        >
            <div className="flex flex-col gap-1 w-[250px]">
                <span className="text-[12px] leading-[16px] tracking-[0.25px] font-[400] text-[var(--on-surface)] line-clamp-1">
                    {renderTitle(notificationTitle)}
                </span>
                <span className="text-[10px] leading-[14px] tracking-[0.5px] font-[400] text-[var(--on-surface-variant)] line-clamp-2">
                    {notificationMessage}
                </span>
                {/* Show market title from localeData if available (indicates translated market) */}
                {localeData?.marketTitle && localeData.marketTitle !== marketTitleForDisplay && (
                    <span className="text-[10px] leading-[14px] tracking-[0.5px] font-[400] text-[var(--on-surface-variant)] line-clamp-1 italic">
                        {localeData.marketTitle}
                    </span>
                )}
            </div>
            <div className="flex-shrink-0">
                <span className="text-[10px] leading-[14px] tracking-[0.5px] font-[500] text-[var(--on-surface-variant)] whitespace-nowrap">
                    {dayjs(createdAt).fromNow()}
                </span>
            </div>
        </div>
    );
}