import Image from "next/image";
import Link from "next/link";

import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { localePath, type Locale } from "@/lib/i18n";

export function SiteLogo({ locale = "es" }: { locale?: Locale }) {
  return (
    <Link href={localePath(locale)} className="site-logo">
      <Image
        src={PLEASE_MARKET_LOGO_SRC}
        alt=""
        width={28}
        height={28}
        className="site-logo__icon"
        priority
        aria-hidden
      />
      <span className="site-logo__text">please.market</span>
    </Link>
  );
}
