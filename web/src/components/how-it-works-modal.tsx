"use client";

import { useEffect } from "react";

import { useTranslations } from "@/components/locale-provider";

type HowItWorksModalProps = {
  open: boolean;
  onClose: () => void;
};

export function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  const t = useTranslations();

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
        <h2 id="how-it-works-title">{t.howItWorks.title}</h2>
        <div className="modal__steps">
          {t.howItWorks.steps.map((step) => (
            <div key={step.title} className="modal__step">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <div className="modal__footer">
          <button className="btn" type="button" onClick={onClose}>
            {t.howItWorks.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}
