"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthButton } from "@/components/auth-button";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { SiteLogo } from "@/components/site-logo";

export function SiteHeader() {
  const [howOpen, setHowOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="site-header__left">
          <SiteLogo />
          <nav className="site-header__nav" aria-label="Main">
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>
        <div className="site-header__actions">
          <button className="btn--how" type="button" onClick={() => setHowOpen(true)}>
            How it works
          </button>
          <AuthButton />
        </div>
      </header>
      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />
    </>
  );
}
