export interface Config {
  factoryAddr: `0x${string}`;
  usdcAddr: `0x${string}`;
  ctfAddr: `0x${string}`;
  routerAddr: `0x${string}`;
  exchangeAddr: `0x${string}`;
  deployerAddr?: `0x${string}`;
  resolutionHub?: `0x${string}`;
  umaResolver?: `0x${string}`;
  faucetAddr?: `0x${string}`;
  validatorAddr?: `0x${string}`;
  multicall3Addr?: string;
}

export interface UserFaucetInfo {
  lastDrip: number;
  canRequest: boolean;
  timeUntilNext: number;
  nextAmount: number;
}

export interface MarketData {
  market_id: string;
  title: string;
  pool: string;
  conditionId: string;
  yesTokenId: string;
  noTokenId: string;
}

export interface PoolStats {
  priceYes: number;
  priceNo: number;
  soldYes: number;
  soldNo: number;
  // totalSupply: number;
}

export interface UserBalances {
  eth: string;
  usdc: string;
  yes: number;
  no: number;
  claimable: number;
}
