export enum AppMessageCode {
  // Errors
  BUY_TOKENS_FAILED = "BUY_TOKENS_FAILED",
  SELL_TOKENS_FAILED = "SELL_TOKENS_FAILED",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  MARKET_DATA_MISSING = "MARKET_DATA_MISSING",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  CLAIM_REWARD_FAILED = "CLAIM_REWARD_FAILED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",

  // Success
  SUCCESS_PREDICTION = "SUCCESS_PREDICTION",
  SUCCESS_SALE = "SUCCESS_SALE",
  SUCCESS_CLAIM = "SUCCESS_CLAIM",

  // Warnings/Info
  PENDING_TRANSACTION = "PENDING_TRANSACTION",
}

export type AppMessageSeverity = "success" | "error" | "info" | "warning";

export type MessageActions =
  | "buy-tokens"
  | "sell-tokens"
  | "claim-reward"
  | "unknown"
  | "connection";

// Localization key type for translations
export type LocalizationKey = string;

export interface AppMessageDefinition {
  code: AppMessageCode;
  severity: AppMessageSeverity;
  title: LocalizationKey;
  description: LocalizationKey;
  devMessage: string;
  action: MessageActions;
}

export class AppError extends Error {
  public readonly code: AppMessageCode;
  public readonly devMessage: string;

  constructor(code: AppMessageCode, devMessage?: string) {
    // Use the code and devMessage for the base Error message so Sentry/logs are descriptive
    super(`${code}${devMessage ? `: ${devMessage}` : ""}`);
    this.code = code;
    this.devMessage = devMessage || "";
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
