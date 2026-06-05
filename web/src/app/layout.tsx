import type { Metadata } from "next";
import { AppPrivyProvider } from "@/components/privy-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chiwiwis — Anyone on X",
  description: "Create prediction markets by tagging @Chiwiwis on X",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppPrivyProvider>
          <header className="site-header">
            <a href="/">Chiwiwis</a>
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
