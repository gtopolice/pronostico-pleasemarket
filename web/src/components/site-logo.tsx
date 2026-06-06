import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/assets/please-market-logo.png";

type SiteLogoProps = {
  size?: "nav" | "hero";
  /** When set, render a heading instead of a link (home page hero). */
  asHeading?: boolean;
};

export function SiteLogo({ size = "nav", asHeading = false }: SiteLogoProps) {
  const iconSize = size === "hero" ? 48 : 28;
  const className = `site-logo site-logo--${size}${asHeading ? " site-logo--heading" : ""}`;

  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt=""
        width={iconSize}
        height={iconSize}
        className="site-logo__icon"
        priority={size === "nav"}
        aria-hidden
      />
      <span className="site-logo__text">please.market</span>
    </>
  );

  if (asHeading) {
    return <h1 className={className}>{content}</h1>;
  }

  return (
    <Link href="/" className={className}>
      {content}
    </Link>
  );
}
