import { File } from "./file";

export interface CreateTraderRequest {
  walletAddress: string;
}

export interface CreateTraderResponse {
  data: Trader;
}

export interface TraderSettings {
  id: number;
  trader: number;
  documentId: string;
  email_notifications: boolean;
  hide_orders_less_than_one_action: boolean;
  notify_webapp_market_resolved: boolean;
  two_factor_authentication: boolean;
  two_factor_confirmed: boolean;
  theme?: "light" | "dark";
  locale?: "es" | "en" | "pt";
}

export interface Trader {
  id: number;
  documentId: string;
  wallet_address: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  settings?: TraderSettings;
  email?: string;
  user_name?: string;
  bio?: string;
  avatar?: File;
  unread_notifications?: number;
}
