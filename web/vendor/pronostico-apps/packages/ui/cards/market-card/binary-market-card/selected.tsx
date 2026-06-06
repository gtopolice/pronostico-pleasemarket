import { OutlineInput } from "../../../inputs/outline-input";
import { Slider } from "../../../slider/slider";
import { useState, useEffect } from "react";
import React from "react";

interface SelectedBinaryProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  estimatedPayout?: string;
}

export function SelectedBinary({
  amount,
  onAmountChange,
  estimatedPayout,
}: SelectedBinaryProps) {
  const numericAmount = parseFloat(amount) || 0;

  const handleOnChangeSlider = (
    _event: Event | React.SyntheticEvent,
    newValue: number | number[]
  ) => {
    const value = newValue as number;
    onAmountChange(value.toString());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, "");
    onAmountChange(value);
  };

  const handleQuickAdd = (addValue: number) => {
    const currentValue = parseFloat(amount) || 0;
    const newValue = (currentValue + addValue).toString();
    onAmountChange(newValue);
  };

  return (
    <div className="w-full flex flex-row items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <OutlineInput
          value={amount}
          onChange={handleInputChange}
          placeholder="1.00"
          type="text"
          inputProps={{ inputMode: "decimal", min: 1, step: 0.01 }}
          endAdornment={
            <div className="flex flex-row items-center gap-1">
              <div
                className="border border-[var(--outline-variant)] rounded-[4px] px-1 py-0.5 cursor-pointer h-[20px] flex items-center justify-center"
                onClick={() => handleQuickAdd(1)}
              >
                <span className="text-[9px] leading-[16px] letter-spacing-[0.5px] font-500 color-[var(--primary)]">
                  +1
                </span>
              </div>
              <div
                className="border border-[var(--outline-variant)] rounded-[4px] px-1 py-0.5 cursor-pointer h-[20px] flex items-center justify-center"
                onClick={() => handleQuickAdd(10)}
              >
                <span className="text-[9px] leading-[16px] letter-spacing-[0.5px] font-500 color-[var(--primary)]">
                  +10
                </span>
              </div>
            </div>
          }
        />
      </div>
      <div className="flex-1" onMouseDown={(e) => e.stopPropagation()}>
        <Slider
          value={numericAmount}
          onChange={handleOnChangeSlider}
          min={1}
          max={100} // Keep it 100 for percentage-like feel or small bets
          step={0.01}
        />
      </div>
    </div>
  );
}
