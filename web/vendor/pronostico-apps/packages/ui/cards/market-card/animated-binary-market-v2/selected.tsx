import { OutlineInput } from "../../../inputs/outline-input";
import { Slider } from "../../../slider/slider";
import React from "react";

interface SelectedProps {
    amount: string;
    onAmountChange: (amount: string) => void;
    estimatedPayout?: string;
    tokenPrice?: string;
    labels?: {
        shares: string;
        avgPrice: string;
        roiActual: string;
    }
}

const quickAddValues = [1, 10, 20, 50];

export function Selected({
    amount,
    onAmountChange,
    estimatedPayout,
    tokenPrice,
    labels
}: SelectedProps) {
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
        <div className="w-full flex flex-col gap-2">
            <div className="w-full">
                <OutlineInput
                    value={amount}
                    className="w-full h-[48px]"
                    onChange={handleInputChange}
                    placeholder="1.00"
                    type="text"
                    inputProps={{ inputMode: "decimal", min: 1, step: 0.01 }}
                    endAdornment={
                        <div className="flex flex-row items-center gap-1">
                            {quickAddValues.map((value) => (
                                <div
                                    key={value}
                                    className="border border-[var(--outline-variant)] rounded-[4px] px-1 py-0.5 cursor-pointer h-[20px] flex items-center justify-center"
                                    onClick={() => handleQuickAdd(value)}
                                >
                                    <span className="text-[9px] leading-[16px] letter-spacing-[0.5px] font-500 color-[var(--primary)]">
                                        +{value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    }
                />
            </div>
            <div
                className="w-full px-2 relative z-20"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <Slider
                    value={numericAmount}
                    onChange={handleOnChangeSlider}
                    min={1}
                    max={100}
                    step={0.01}
                    className="w-full"
                />
            </div>
            <div className="flex flex-row justify-between gap-2 text-[var(--primary)] text-[12px]">
                <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center py-1">
                    <div className="roi-cell-label">{labels?.avgPrice ?? "AVG price"}</div>
                    <div className="roi-cell-val white" id="m-tokens">${Number(tokenPrice) > 0 ? Number(tokenPrice).toFixed(2) : "0.00"}</div>
                </div>
                <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center py-1">
                    <div className="roi-cell-label">{labels?.shares ?? "Shares"}</div>
                    <div className="roi-cell-val white" id="m-tokens">{(Number(tokenPrice) > 0 ? (Number(amount) / Number(tokenPrice)) : 0).toFixed(0)}</div>
                </div>
                <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center py-1">
                    <div className="roi-cell-label">{labels?.roiActual ?? "ROI actual"}</div>
                    <div className="roi-cell-val green" id="m-roi">{((Number(estimatedPayout) / (Number(amount) || 1))).toFixed(2) + "x"}</div>
                </div>
                {/* <div className="bg-[var(--surface-container-high)] rounded-[12px] w-full flex flex-col items-center justify-center">
                    <div className="roi-cell-label">{labels?.roiPot ?? "ROI pot."}</div>
                    <div className="roi-cell-val green" id="m-roi">{((Number(estimatedPayout) / (Number(amount) || 1)) + (Number(amount) > 0 && Number(estimatedPayout) > 0 ? 0.5 : 0)).toFixed(2) + "x"}</div>
                </div> */}
            </div>
        </div>
    );
}