import { Market } from "./markets";
import { Trader } from "./traders";

/**
 * Main Claim interface representing a user's claim for a resolved market
 */
export interface Claim {
    id: number;
    documentId: string;
    outcome: "YES" | "NO";
    reward: string; // Decimal string representing the reward amount
    redeemed_at: string | null; // ISO date string when the claim was redeemed
    tx_hash: string | null; // Transaction hash of the redemption
    trader: Trader;
    market: ClaimByMarket;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

/**
 * Extended Market interface with calculated fields for claims
 * Includes the original market data plus computed trading metrics
 */
export interface ClaimByMarket extends Market {
    average_price: number; // Average price paid per token
    to_win: number; // Total amount to win (reward)
    return_investment: number; // Net profit (to_win - invested)
    value: number; // Current value of the tokens
    selected_share: "YES" | "NO"; // Winning side
}

/**
 * API response structure for the claims endpoint
 */
export interface ClaimsResponse {
    data: Claim[];
    meta: {
        total: number;
    };
}
