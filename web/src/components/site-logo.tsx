import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="site-logo">
      Please.market <span className="site-logo__mark">▲</span>
    </Link>
  );
}
