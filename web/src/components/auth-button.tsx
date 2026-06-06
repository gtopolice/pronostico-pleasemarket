"use client";

import { useFundWallet, useLinkAccount, usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { baseSepolia } from "viem/chains";

import { walletContextFromUser } from "@/lib/api";
import { twitterOAuthAccount } from "@/lib/twitter-account";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function walletAvatarLabel(address: string) {
  return address.slice(2, 4).toUpperCase();
}

function UserAvatar({
  profilePictureUrl,
  fallbackLabel,
  size = "md",
}: {
  profilePictureUrl?: string | null;
  fallbackLabel?: string;
  size?: "md" | "lg";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const className = `wallet-menu__avatar${size === "lg" ? " wallet-menu__avatar--lg" : ""}`;
  const showImage = Boolean(profilePictureUrl) && !imageFailed;

  if (showImage && profilePictureUrl) {
    return (
      <span className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profilePictureUrl}
          alt=""
          className="wallet-menu__avatar-image"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden>
      {fallbackLabel ?? "•"}
    </span>
  );
}

const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org/address";

export function AuthButton() {
  const menuId = useId();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { linkTwitter } = useLinkAccount();
  const { fundWallet } = useFundWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const ctx = walletContextFromUser(user ?? null);
  const address = ctx.smartWallet ?? ctx.wallet ?? null;
  const twitter = twitterOAuthAccount(user?.linkedAccounts);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const closeMenu = () => setOpen(false);

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
  };

  const handleFundWallet = async () => {
    if (!address) return;
    closeMenu();
    await fundWallet({
      address,
      options: { chain: baseSepolia },
    });
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  if (!ready) {
    return (
      <span className="wallet-menu__trigger wallet-menu__trigger--loading" aria-hidden>
        <span className="wallet-menu__spinner" />
      </span>
    );
  }

  if (!authenticated) {
    return (
      <button className="wallet-menu__trigger wallet-menu__trigger--signin" type="button" onClick={login}>
        <PersonIcon />
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <div className="wallet-menu" ref={rootRef}>
      <button
        className="wallet-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar
          profilePictureUrl={twitter?.profilePictureUrl}
          fallbackLabel={address ? walletAvatarLabel(address) : "•"}
        />
        <span className="wallet-menu__label">{address ? shortenAddress(address) : "Account"}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="wallet-menu__dropdown" id={menuId} role="menu">
          <div className="wallet-menu__header">
            <UserAvatar
              profilePictureUrl={twitter?.profilePictureUrl}
              fallbackLabel={address ? walletAvatarLabel(address) : "•"}
              size="lg"
            />
            <div className="wallet-menu__identity">
              <strong>{twitter?.username ? `@${twitter.username}` : "Connected wallet"}</strong>
              <span>{address ?? "No wallet loaded"}</span>
            </div>
          </div>

          <div className="wallet-menu__section" role="none">
            <Link className="wallet-menu__item" href="/dashboard" role="menuitem" onClick={closeMenu}>
              <DashboardIcon />
              Dashboard
            </Link>
            {address ? (
              <>
                <button className="wallet-menu__item" type="button" role="menuitem" onClick={handleFundWallet}>
                  <FundIcon />
                  Fund wallet
                </button>
                <button className="wallet-menu__item" type="button" role="menuitem" onClick={handleCopyAddress}>
                  <CopyIcon />
                  {copied ? "Copied" : "Copy address"}
                </button>
                <a
                  className="wallet-menu__item"
                  href={`${BASE_SEPOLIA_EXPLORER}/${address}`}
                  role="menuitem"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  <ExternalIcon />
                  View on BaseScan
                </a>
              </>
            ) : null}
            {!twitter ? (
              <button
                className="wallet-menu__item"
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  linkTwitter();
                }}
              >
                <LinkIcon />
                Link X account
              </button>
            ) : null}
          </div>

          <div className="wallet-menu__section wallet-menu__section--footer" role="none">
            <button
              className="wallet-menu__item wallet-menu__item--danger"
              type="button"
              role="menuitem"
              onClick={handleLogout}
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`wallet-menu__chevron${open ? " wallet-menu__chevron--open" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v18M17 8H9.5a3.5 3.5 0 1 0 0 7H14a3.5 3.5 0 0 1 0 7H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 14a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 10a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
