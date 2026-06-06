import Image from "next/image";
import Link from "next/link";

import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";

export function SiteLogo() {
  return (
    <Link href="/" className="site-logo">
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
