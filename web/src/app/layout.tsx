import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { AppPrivyProvider } from "@/components/privy-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "please.market — prediction markets on X",
  description: "Create prediction markets by tagging @PleaseMarketBot on X",
  icons: {
    icon: "/assets/please_logo.png",
    apple: "/assets/please_logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${roboto.variable}`}>
      <body>
        <AppPrivyProvider>
          <div className="site-shell">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </AppPrivyProvider>
      </body>
    </html>
  );
}
