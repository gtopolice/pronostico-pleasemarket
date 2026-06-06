"use client";

export interface SecondaryWalletCardProps {
  title: string;
  value: string;
}

export function SecondaryWalletCard({
  title,
  value,
}: SecondaryWalletCardProps) {
  return (
    <div className="border border-[var(--outline)] rounded-[12px] py-6 px-4 w-full flex flex-col h-[160px] gap-2.5 bg-[var(--surface-container-lowest)]">
      <span className="text-[16px] font-700 leading-[24px] tracking-[0.5px] text-[var(--primary)]">
        {title}
      </span>
      <span className="text-[24px] font-700 leading-[32px] tracking-[0px] text-[var(--primary)]">
        {value}
      </span>
      <span className="text-[12px] font-400 leading-[16px] tracking-[0.4px] text-[var(--surface-tint)]">
        Total
      </span>
    </div>
  );
}
