"use client";

import { CardWrapper } from "../card-wrapper";
import { BinarySelection } from "./selection";
import { SelectedBinary } from "./selected";
import { MarketCardProps } from "../types/interfaces";
import { Footer, Header } from "../shared";
import { Button } from "../../../buttons/button";
import { motion, AnimatePresence } from "framer-motion";
import { Market } from "@pronostico-apps/interfaces";

export interface BinaryMarketCardProps extends MarketCardProps {
  market?: Market;
  selectedBinary: "yes" | "no" | null;
  amount: string;
  estimatedPayout: string;
  displayPrice: string;
  isTradingLoading: boolean;
  tradingError?: string | null;
  isConnected: boolean;
  onSelect: (value: "yes" | "no") => void;
  onAmountChange: (value: string) => void;
  onBuy: () => void;
  onClose: () => void;
  isFirstRender: boolean;
  isPurchasing: boolean;
  userBalance?: number;
  labels?: {
    buy?: string;
    yesLabel?: string;
    noLabel?: string;
    predicting?: string;
    toWin?: string;
  };
}

export function BinaryMarketCard(props: BinaryMarketCardProps) {
  const {
    selectedBinary,
    amount,
    estimatedPayout,
    displayPrice,
    isTradingLoading,
    tradingError,
    isConnected,
    onSelect,
    onAmountChange,
    onBuy,
    onClose,
    isFirstRender,
    isPurchasing,
    userBalance,
    labels = {},
    ...restProps
  } = props;

  const defaultLabels = {
    buy: "Compra",
    yesLabel: "SI",
    noLabel: "NO",
    predicting: "Pronosticando...",
    toWin: "Para ganar",
  };
  const l = { ...defaultLabels, ...labels };

  return (
    <CardWrapper isSelected={selectedBinary !== null}>
      <div className="w-full" onClick={() => props.onClick?.(props.id)}>
        <Header
          {...restProps}
          isOpen={selectedBinary !== null}
          onClose={onClose}
        />
      </div>
      <AnimatePresence mode="wait">
        {selectedBinary ? (
          <motion.div
            key="selected"
            initial={isFirstRender ? false : { x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col gap-2"
          >
            <SelectedBinary
              amount={amount}
              onAmountChange={onAmountChange}
              estimatedPayout={estimatedPayout}
            />
            {tradingError && (
              <div className="text-[12px] text-red-500 px-2">
                {tradingError}
              </div>
            )}
            <Button
              className="rounded-full"
              variant={selectedBinary === "yes" ? "primary" : "secondary"}
              label={`${l.buy} ${selectedBinary === "yes" ? l.yesLabel : l.noLabel}`}
              labelBottom={
                isPurchasing
                  ? l.predicting
                  : `${l.toWin} $${estimatedPayout}`
              }
              isActive={selectedBinary !== null}
              onClick={() => {
                onBuy();
              }}
              disabled={
                props?.market?.visibility === "UNLISTED" ||
                (props?.market?.close_time_utc
                  ? new Date(props.market.close_time_utc).getTime()
                  : 0) < Date.now() ||
                props?.market?.resolution_result !== null ||
                isTradingLoading ||
                parseFloat(amount) < 1 ||
                !isConnected ||
                parseFloat(estimatedPayout) <= 0 ||
                (userBalance ?? 0) < parseFloat(amount)
              }
            />
            {/* {displayPrice && (
              <div className="text-[10px] text-[var(--on-surface-variant)] px-2">
                Precio: ${displayPrice}
              </div>
            )} */}
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={isFirstRender ? false : { x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col gap-4"
          >
            <BinarySelection
              onSelect={onSelect}
              isLoading={props.isLoading}
              disabled={props.disabled || props?.market?.visibility === "UNLISTED" ||
                (props?.market?.close_time_utc
                  ? new Date(props.market.close_time_utc).getTime()
                  : 0) < Date.now() ||
                props?.market?.resolution_result !== null}
              labels={{
                yesLabel: l.yesLabel,
                noLabel: l.noLabel,
              }}
            />
            <Footer {...restProps} />
          </motion.div>
        )}
      </AnimatePresence>
    </CardWrapper>
  );
}
