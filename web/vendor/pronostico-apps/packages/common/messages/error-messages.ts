import { AppMessageCode, AppMessageDefinition } from "./types";

export const ErrorDefinitions: Partial<
  Record<AppMessageCode, AppMessageDefinition>
> = {
  [AppMessageCode.BUY_TOKENS_FAILED]: {
    code: AppMessageCode.BUY_TOKENS_FAILED,
    severity: "error",
    title: "messages.buyTokensFailed.title",
    description: "messages.buyTokensFailed.description",
    devMessage: "Error purchasing tokens in the prediction market",
    action: "buy-tokens",
  },
  [AppMessageCode.SELL_TOKENS_FAILED]: {
    code: AppMessageCode.SELL_TOKENS_FAILED,
    severity: "error",
    title: "messages.sellTokensFailed.title",
    description: "messages.sellTokensFailed.description",
    devMessage: "Error selling tokens in the prediction market",
    action: "sell-tokens",
  },
  [AppMessageCode.INSUFFICIENT_FUNDS]: {
    code: AppMessageCode.INSUFFICIENT_FUNDS,
    severity: "error",
    title: "messages.insufficientFunds.title",
    description: "messages.insufficientFunds.description",
    devMessage: "User has insufficient funds for the transaction",
    action: "buy-tokens",
  },
  [AppMessageCode.MARKET_DATA_MISSING]: {
    code: AppMessageCode.MARKET_DATA_MISSING,
    severity: "error",
    title: "messages.marketDataMissing.title",
    description: "messages.marketDataMissing.description",
    devMessage: "Missing market data or pool address",
    action: "unknown",
  },
  [AppMessageCode.WALLET_NOT_CONNECTED]: {
    code: AppMessageCode.WALLET_NOT_CONNECTED,
    severity: "error",
    title: "messages.walletNotConnected.title",
    description: "messages.walletNotConnected.description",
    devMessage: "User attempted an action without a connected wallet",
    action: "connection",
  },
  [AppMessageCode.CLAIM_REWARD_FAILED]: {
    code: AppMessageCode.CLAIM_REWARD_FAILED,
    severity: "error",
    title: "messages.claimRewardFailed.title",
    description: "messages.claimRewardFailed.description",
    devMessage: "Claim reward transaction failed",
    action: "claim-reward",
  },
  [AppMessageCode.UNKNOWN_ERROR]: {
    code: AppMessageCode.UNKNOWN_ERROR,
    severity: "error",
    title: "messages.unknownError.title",
    description: "messages.unknownError.description",
    devMessage: "An unknown or unhandled error occurred",
    action: "unknown",
  },
};