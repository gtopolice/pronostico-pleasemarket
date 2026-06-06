"use client";

import { useEffect } from "react";

type HowItWorksModalProps = {
  open: boolean;
  onClose: () => void;
};

const STEPS = [
  {
    title: "1. Tag @PleaseMarketBot on X",
    description:
      "Tweet a yes/no question and mention @PleaseMarketBot. Our AI parses it into a binary prediction market.",
  },
  {
    title: "2. Link your wallet",
    description:
      "Reply with a one-time link. Sign in with Privy and connect the same X account so we know you are the creator.",
  },
  {
    title: "3. Market goes live",
    description:
      "Your market appears on Please.market. You resolve within 48h after close; traders bet on Anyone.",
  },
];

export function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-labelledby="how-it-works-title" aria-modal="true">
        <h2 id="how-it-works-title">How it works</h2>
        <div className="modal__steps">
          {STEPS.map((step) => (
            <div key={step.title} className="modal__step">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <div className="modal__footer">
          <button className="btn" type="button" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
