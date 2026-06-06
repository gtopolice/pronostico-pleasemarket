import type { Metadata } from "next";
import { AppPrivyProvider } from "@/components/privy-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Please.market — prediction markets on X",
  description: "Create prediction markets by tagging @PleaseMarket on X",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppPrivyProvider>
          <header className="site-header">
            <a href="/">Please.market</a>
            <nav>
              <a href="/leaderboard">Leaderboard</a>
              <a href="/dashboard">Dashboard</a>
            </nav>
          </header>
          <main>{children}</main>
        </AppPrivyProvider>
      </body>
    </html>
  );
}
