"use client";

import { useState } from "react";

type RulesAccordionProps = {
  rules: string;
};

export function RulesAccordion({ rules }: RulesAccordionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="accordion">
      <div className="accordion__item" data-open={open}>
        <button
          className="accordion__trigger"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span>Resolution rules</span>
          <span className="accordion__icon" aria-hidden="true">
            ▾
          </span>
        </button>
        {open ? <div className="accordion__panel">{rules}</div> : null}
      </div>
    </div>
  );
}
