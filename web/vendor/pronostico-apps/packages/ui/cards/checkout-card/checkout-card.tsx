"use client";
import { Button } from "../../buttons/button";
import { ButtonTabs } from "../../buttons/button-tabs";
import { Market } from "../../../interfaces/markets";
import { formatNumber } from "../../../prediction-market/utils/format";
import { Signer, Provider } from "ethers";
import {
  useEffect,
  useMemo,
} from "react";
import {
  AppMessageCode,
  getAppMessageDefinition,
  getLocalizedDescription,
} from "@pronostico-apps/common";
import AmountInput from "../../inputs/amount-input";

const OPTIONS = [
  {
    label: "Comprar",
    value: "comprar",
    id: 1,
  },
  {
    label: "Vender",
    value: "vender",
    id: 2,
  },
];
const AMOUNTS = [1, 5, 10, 20, 100];
const SELL_AMOUNTS = [5, 10, 25, 50, 100];

// Type for dictionary - supports nested objects
type Dictionary = Record<string, Record<string, any>>;

interface CheckoutCardProps {
  market: Market;
  signer?: Signer;
  provider?: Provider;
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
  buyYes: boolean;
  setBuyYes: (buyYes: boolean) => void;
  amount: number;
  setAmount: (amount: number) => void;
  tokenAmount: string;
  estCost: string;
  balances: {
    usdc: string;
    yes: number;
    no: number;
  };
  stats: {
    priceYes: number;
    priceNo: number;
  } | null;
  isLoading: boolean;
  error?: AppMessageCode | null;
  onTrade: () => Promise<void>;
  /** Hide the "Vender" tab - for V3 markets that don't support selling */
  hideSellTab?: boolean;
  /** Potential win amount (for V3 markets - calculated via CPMM formula) */
  potentialWin?: string;
  /** Demo stablecoin ticker (e.g. MXNB) — suffix instead of $ prefix */
  demoCurrency?: string;
  dictionary?: Dictionary;
  labels?: {
    profit?: string;
    shares?: string;
    insufficientBalance?: string;
    amount?: string;
    balance?: string;
    buy?: string;
    sell?: string;
    yes?: string;
    no?: string;
    max?: string;
    youWillReceive?: string;
    predicting?: string;
    buyYes?: string;
    buyNo?: string;
    sellYes?: string;
    sellNo?: string;
    insufficientShares?: string;
    avgPrice?: string;
    roiPot?: string;
    roiActual?: string;
  };
}

export function CheckoutCard(props: CheckoutCardProps) {
  const {
    selectedTab,
    setSelectedTab,
    buyYes,
    setBuyYes,
    amount,
    setAmount,
    tokenAmount,
    estCost,
    balances,
    stats,
    isLoading,
    error,
    onTrade,
    hideSellTab,
    potentialWin,
    labels = {},
    demoCurrency,
  } = props;

  const formatMoney = (value: number | string, digits = 2) => {
    const formatted = formatNumber(Number(value), digits);
    if (demoCurrency) return `${formatted} ${demoCurrency}`;
    return `$${formatted}`;
  };

  // Force selectedTab to 1 (Comprar) when hideSellTab is enabled
  useEffect(() => {
    if (hideSellTab && selectedTab !== 1) {
      setSelectedTab(1);
    }
  }, [hideSellTab, selectedTab, setSelectedTab]);

  const defaultLabels = {
    buy: "Comprar",
    sell: "Vender",
    yes: "Sí",
    no: "No",
    max: "Max",
    profit: "Ganancia",
    youWillReceive: "Recibirás",
    predicting: "Pronosticando...",
    buyYes: "Comprar Sí",
    buyNo: "Comprar No",
    sellYes: "Vender Sí",
    sellNo: "Vender No",
    insufficientShares: "No tienes suficientes acciones",
    shares: "Acciones",
    roiActual: "ROI actual",
    roiPot: "ROI pot.",
  };
  const l = { ...defaultLabels, ...labels };

  const baseOptions = [
    {
      label: l.buy,
      value: "comprar",
      id: 1,
    },
  ];
  const sellOption = {
    label: l.sell,
    value: "vender",
    id: 2,
  };
  const OPTIONS = props.hideSellTab ? baseOptions : [...baseOptions, sellOption];

  const priceYes = stats ? (stats.priceYes * 100).toFixed(0) : "--";
  const priceNo = stats ? (stats.priceNo * 100).toFixed(0) : "--";

  // ── Button state ──────────────────────────────────────────────────────────
  const marketEnded =
    props.market?.state === "CLOSED" ||
    (props.market?.close_time_utc
      ? new Date(props.market.close_time_utc).getTime() < Date.now()
      : false) ||
    props.market?.resolution_result !== null;

  // const hasNoSigner = props.signer === undefined || props.provider === undefined;
  const hasNoAmount = amount <= 0 || (selectedTab === 1 && amount < 1);

  const exceedsBalance =
    selectedTab === 1
      ? amount > Number(balances.usdc)
      : amount > Number(buyYes ? balances.yes : balances.no);

  const isDisabled = marketEnded || isLoading || hasNoAmount || exceedsBalance;
  const isMarketActive = !marketEnded;

  const disabledReason = isDisabled
    ? [
      marketEnded && "marketEnded",
      isLoading && "isLoading",
      hasNoAmount && `hasNoAmount(amount=${amount}, tab=${selectedTab})`,
      // hasNoSigner && "hasNoSigner",
      exceedsBalance && `exceedsBalance(amount=${amount}, usdc=${balances.usdc})`,
    ].filter(Boolean).join(" | ")
    : null;

  if (disabledReason) {
    console.log("[CheckoutCard] ❌ disabled:", disabledReason);
  }

  const buttonVariant = isDisabled
    ? "outline"
    : buyYes
      ? "primary"
      : "secondary";

  return (
    <div className="border border-[var(--outline)] rounded-[12px] py-3 px-0 w-full gap-4 flex flex-col">
      <ButtonTabs
        options={OPTIONS}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <div className="flex flex-row items-center justify-between gap-2 px-5">
        <Button
          className="rounded-full"
          label={`${l.yes} ${priceYes}¢`}
          onClick={() => {
            setAmount(selectedTab === 1 ? 1 : 0);
            setBuyYes(true);
          }}
          variant={buyYes ? "primary" : "tertiary"}
          isActive={buyYes}
        />
        <Button
          className="rounded-full"
          label={`${l.no} ${priceNo}¢`}
          onClick={() => {
            setAmount(selectedTab === 1 ? 1 : 0);
            setBuyYes(false);
          }}
          variant={!buyYes ? "secondary" : "tertiary"}
          isActive={!buyYes}
        />
      </div>

      {selectedTab === 1 && (
        <div className="flex px-5 flex-row items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[16px] leading-[24px] tracking-[0.5px] font-[700] text-[var(--primary)]">
              {l.amount}
            </span>
            <span className="text-[12px] leading-[16px] tracking-[0.4px] font-[400] text-[var(--surface-tint)]">
              {`${l.balance}: ${formatMoney(balances.usdc, 2)}`}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex flex-row items-center gap-1">
              {!demoCurrency ? (
                <span className="text-[24px] leading-[32px] tracking-[0px] font-[700] text-[var(--primary)]">$</span>
              ) : null}
              <AmountInput
                // step={0.01}
                // max={1000}
                size="small"
                value={
                  amount
                }
                onValueChange={(e) => {
                  if (e !== null && e >= 0) {
                    setAmount(e);
                  }

                }}
                className="w-[80px] text-[24px] leading-[32px] tracking-[0px] font-[700] text-[var(--primary)]"
              />
              {demoCurrency ? (
                <span className="text-[14px] leading-[20px] font-[600] text-[var(--surface-tint)] ml-1">
                  {demoCurrency}
                </span>
              ) : null}
            </div>
            {selectedTab === 1 && amount > Number(balances.usdc) && (
              <span className="text-[12px] leading-[16px] tracking-[0.4px] font-[400] text-[var(--error)]">
                {l.insufficientBalance}
              </span>
            )}
          </div>
        </div>
      )}

      {selectedTab === 2 && (
        <div className="flex px-5 flex-row items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[16px] leading-[24px] tracking-[0.5px] font-[700] text-[var(--primary)]">
              {l.shares}
            </span>
            <div className="h-[20px] w-[50px]"></div>
          </div>
          <div className="flex flex-col items-end">
            <AmountInput
              // step={0.01}
              size="small"
              value={
                amount > 1000
                  ? 1000
                  : amount
              }
              onValueChange={(e) => {
                if (e !== null && e >= 0) {
                  const maxVal = buyYes ? balances.yes : balances.no;
                  setAmount(e > maxVal ? maxVal : e);
                }

              }}
              className="w-[80px] text-[24px] leading-[32px] tracking-[0px] font-[700] text-[var(--primary)]"
            />
            {(amount > Number(buyYes ? balances.yes : balances.no) ||
              Number(buyYes ? balances.yes : balances.no) === 0) && (
                <span className="text-[12px] leading-[16px] tracking-[0.4px] font-[400] text-[var(--error)]">
                  {l.insufficientShares || "No tienes suficientes acciones"}
                </span>
              )}
          </div>
        </div>
      )}

      {selectedTab === 1 && (
        <div className="flex flex-row items-center justify-end gap-1 px-5">
          {AMOUNTS.map((amt) => (
            <Button
              size="small"
              variant="outline"
              key={amt}
              label={demoCurrency ? `${amt} ${demoCurrency}` : `$${amt}`}
              sx={{
                padding: "7px 8px !important",
                minWidth: "35px",
                width: "auto",
                height: "25px",
                fontSize: "11px",
                fontWeight: "500",
                lineHeight: "16px",
                letterSpacing: "0.5px",
                color: "var(--on-surface)",
              }}
              onClick={() => setAmount(amt)}
            />
          ))}
        </div>
      )}

      {selectedTab === 2 && (
        <div className="flex flex-row items-center justify-end gap-1 px-5">
          {SELL_AMOUNTS.map((amt) => (
            <Button
              size="small"
              variant="outline"
              key={"sell-" + amt}
              label={`${amt === 100 ? l.max : String(amt) + "%"}`}
              sx={{
                padding: "7px 8px !important",
                minWidth: "35px",
                width: "auto",
                height: "25px",
                fontSize: "11px",
                fontWeight: "500",
                lineHeight: "16px",
                letterSpacing: "0.5px",
                color: "var(--on-surface)",
              }}
              onClick={() => {
                setAmount(
                  Number((amt * (buyYes ? balances.yes : balances.no)) / 100)
                );
              }}
            />
          ))}
        </div>
      )}

      {amount > 0 && (
        <div>
          <div className="border-b border-b-[0.5px] border-[var(--outline-variant)] relative mb-2"></div>
          <div className="flex px-5 flex-row items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[16px] leading-[24px] tracking-[0.5px] font-[700] text-[var(--primary)]">
                {selectedTab === 1 ? (l.profit) : l.youWillReceive}
              </span>
              {/* <span className="text-[12px] leading-[16px] tracking-[0.4px] font-[400] text-[var(--surface-tint)]">
                {`${l.avgPrice}:: ${formatNumber(Number(estCost) / (Number(tokenAmount) || 1), 2)}`}
              </span> */}
            </div>
            <span className="text-[24px] leading-[32px] tracking-[0px] font-[700] text-[var(--tertiary-fixed-dim)]">
              {formatMoney(
                selectedTab === 1
                  ? (potentialWin ? Number(potentialWin) : Number(tokenAmount))
                  : Number(estCost),
                2,
              )}
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-row justify-between gap-2 text-[var(--primary)] text-[12px] px-5">
        <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center py-1">
          <div className="roi-cell-label">{labels?.avgPrice ?? "AVG price"}</div>
          <div className="roi-cell-val white" id="m-tokens">
            {formatMoney(Number(estCost) / (Number(tokenAmount) || 1), 2)}
          </div>
        </div>
        <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center py-1">
          <div className="roi-cell-label">{labels?.shares ?? "Shares"}</div>
          <div className="roi-cell-val white" id="m-tokens">{Number(tokenAmount) > 0 ? Number(tokenAmount).toFixed(0) : "0"}</div>
        </div>
        <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center py-1">
          <div className="roi-cell-label">{labels?.roiActual ?? "ROI actual"}</div>
          <div className="roi-cell-val green" id="m-roi">{((potentialWin ? Number(potentialWin) : Number(tokenAmount)) / Number(amount || 1) || 1).toFixed(2)}x</div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center px-5 gap-2 my-2">
        <Button
          className="rounded-full"
          disabled={isDisabled}
          label={
            isLoading
              ? l.predicting
              : selectedTab === 1
                ? buyYes
                  ? l.buyYes
                  : l.buyNo
                : buyYes
                  ? l.sellYes
                  : l.sellNo
          }
          onClick={onTrade}
          variant={buttonVariant}
          isActive={isMarketActive}
        />
      </div>
      {error && (
        <div className="px-5 text-red-500 text-xs italic">
          {props.dictionary
            ? getLocalizedDescription(error, props.dictionary)
            : getAppMessageDefinition(error).description}
        </div>
      )}
    </div>
  );
}
