import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { resolveMarketRedirectUrl } from "@/lib/market-redirect";

export const metadata: Metadata = {
  title: "Please.market",
};

export default async function MarketPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;
  redirect(resolveMarketRedirectUrl(id));
}
