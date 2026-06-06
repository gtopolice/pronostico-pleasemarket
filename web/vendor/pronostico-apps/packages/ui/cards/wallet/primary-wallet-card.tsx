"use client";

import { Button } from "@mui/material";
import { DepositIcon, WithdrawIcon } from "@pronostico-apps/ui";

export interface PrimaryWalletCardProps {
  title: string;
  value: string;
  labels?: {
    deposit?: string;
    withdraw?: string;
    totalAvailable?: string;
  };
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export function PrimaryWalletCard({
  title,
  value,
  onDeposit,
  onWithdraw,
  labels
}: PrimaryWalletCardProps) {
  return (
    <div className="border border-[var(--outline)] rounded-[12px] py-6 px-4 w-full flex flex-col h-[179px] sm:h-[160px] gap-2.5 bg-[var(--tertiary-container)]">
      <span className="text-[16px] font-700 leading-[24px] tracking-[0.5px] text-[var(--on-tertiary-container)]">
        {title}
      </span>
      <span className="text-[24px] font-700 leading-[32px] tracking-[0px] text-[var(--on-tertiary-container)]">
        {value}
      </span>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center">
        <span className="text-[12px] font-400 leading-[16px] tracking-[0.4px] text-[var(--on-tertiary-container)]">
          {labels?.totalAvailable || "Total Disponible"}
        </span>
        {/*<div className="flex flex-row gap-2 justify-end">
          <Button
            variant="contained"
            onClick={onDeposit}
            startIcon={
              <DepositIcon color="var(--primary)" height={16} width={16} />
            }
            disableElevation
            sx={{
              backgroundColor: "var(--secondary-container)",
              color: "var(--primary)",
              fontWeight: "500",
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0.1px",
              textAlign: "center",
              verticalAlign: "middle",
              fontStyle: "Medium",
              textTransform: "none",
              borderRadius: "100px",
              height: "40px",
            }}
          >
            Deposito
          </Button>
          <Button
            variant="contained"
            onClick={onWithdraw}
            startIcon={
              <WithdrawIcon color="var(--primary)" height={16} width={16} />
            }
            disableElevation
            sx={{
              backgroundColor: "var(--secondary-container)",
              color: "var(--primary)",
              fontWeight: "500",
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0.1px",
              textAlign: "center",
              verticalAlign: "middle",
              fontStyle: "Medium",
              textTransform: "none",
              borderRadius: "100px",
              height: "40px",
            }}
          >
            Retiro
          </Button>
        </div>*/}
      </div>
    </div>
  );
}
