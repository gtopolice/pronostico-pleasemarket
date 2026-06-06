"use client";

import { useClaimMusdc } from "@/hooks/use-claim-musdc";
import { txExplorerUrl } from "@/lib/tx-explorer";

type ClaimMusdcButtonProps = {
  walletAddress?: string | null;
  onClaimSuccess?: () => Promise<void> | void;
  compact?: boolean;
  labels: {
    title: string;
    description: string;
    claim: string;
    claiming: string;
    insufficient: string;
    success: string;
  };
};

export function ClaimMusdcButton({
  walletAddress,
  onClaimSuccess,
  compact = false,
  labels,
}: ClaimMusdcButtonProps) {
  const { claim, stage, error, txHash, isClaiming } = useClaimMusdc(walletAddress);

  const handleClaim = async () => {
    const hash = await claim();
    if (hash) await onClaimSuccess?.();
  };

  if (compact) {
    return (
      <div className="claim-musdc claim-musdc--compact card">
        <div className="claim-musdc__row">
          <p className="claim-musdc__hint">{labels.insufficient}</p>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => void handleClaim()}
            disabled={isClaiming}
          >
            {isClaiming ? labels.claiming : labels.claim}
          </button>
        </div>
        {txHash ? (
          <p className="claim-musdc__tx">
            <a href={txExplorerUrl(txHash)} target="_blank" rel="noreferrer">
              {txHash.slice(0, 10)}…
            </a>
          </p>
        ) : null}
        {stage === "success" ? <p className="claim-musdc__success">{labels.success}</p> : null}
        {error ? <p className="claim-musdc__error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="claim-musdc card">
      <p className="claim-musdc__eyebrow">{labels.title}</p>
      <p className="claim-musdc__description">{labels.description}</p>
      <button type="button" className="btn" onClick={() => void handleClaim()} disabled={isClaiming}>
        {isClaiming ? labels.claiming : labels.claim}
      </button>
      {txHash ? (
        <p className="claim-musdc__tx">
          <a href={txExplorerUrl(txHash)} target="_blank" rel="noreferrer">
            {txHash}
          </a>
        </p>
      ) : null}
      {stage === "success" ? <p className="claim-musdc__success">{labels.success}</p> : null}
      {error ? <p className="claim-musdc__error">{error}</p> : null}
    </div>
  );
}
