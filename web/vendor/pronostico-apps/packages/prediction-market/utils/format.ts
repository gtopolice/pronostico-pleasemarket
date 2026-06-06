import { ethers } from "ethers";

export const formatUSDC = (amount: bigint): string => {
  return ethers.formatUnits(amount, 6);
};

export const parseUSDC = (amount: string): bigint => {
  return ethers.parseUnits(amount, 6);
};

export const formatToken = (amount: bigint, decimals: number = 2): string => {
  const formatted = ethers.formatUnits(amount, 18);
  const numberValue = parseFloat(formatted);
  return numberValue.toFixed(decimals);
};

export const parseToken = (amount: string): bigint => {
  return ethers.parseUnits(amount, 18);
};

export const formatPrice = (price: bigint): number => {
  return parseFloat(ethers.formatUnits(price, 18));
};

export const formatNumber = (value: string | number, decimals: number = 5) => {
  const numberValue =
    typeof value === "string"
      ? parseFloat(value.replace(/,/g, ""))
      : value;
  if (isNaN(numberValue)) return "0";
  return numberValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
