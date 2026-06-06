import { Market } from "./markets";

export interface CreatePositionRequest {
  walletAddress?: string;
  marketId: string;
  selectedShare: "YES" | "NO";
  txHash: string;
  receivedTokens: number;
  tokensEstimatedCost: number;
  sharePriceAtPurchase: number;
}

export interface Position {
  id: number;
  documentId: string;
  selected_share: "YES" | "NO";
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  tx_hash: string;
  market?: Market;
  received_tokens: number;
  tokens_estimated_cost: number;
  share_price_at_purchase: number;
}

export interface CreatePositionResponse {
  data: Position;
}

export interface myPositionsResponse {
  data: PositionByMarket[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface PositionByMarket extends Market {
  positions: Omit<Position, "market">[];
  average_price: number;
  to_win: number;
  return_investment: number;
  value: number;
  selected_share: "YES" | "NO";

  // V3 (CPMM) additional fields
  shares_balance?: number;      // Your shares amount (18 decimals)
  cost_basis?: number;         // Total USDC spent (6 decimals)  
  current_price?: number;     // Current market price [0,1]
  total_shares?: number;      // Total shares in market (both outcomes)
  total_collateral?: number;  // Total USDC in market
  payout?: number;         // What you'd get if your outcome wins
}

export interface MyPositionsStatsResponse {
  positions: number;
  markets: number;
  earnings_and_losses: number;
}

export interface MarketChartResponse {
  current_probability: number;
  data: {
    x: string;
    y: number;
  }[];
}
