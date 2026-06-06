export type MarketCardType = "MULTIPLE" | "BINARY" | "SCALAR";
export interface MultiSelectOptions {
  label: string;
  percentage: number;
}

export interface MarketCardProps {
  id: number | string;
  documentId?: string;
  image: string;
  title: string;
  type?: MarketCardType;
  multiSelectOptions?: MultiSelectOptions[];
  teams?: Team[];
  openTimeUtc?: string;
  countryName?: string;
  countryCode?: string;
  enableRepeat?: boolean;
  volume?: string;
  serie?: string;
  isLoading?: boolean;
  onClick?: (id: number | string) => void;
  // Blockchain fields for YES/NO trading
  pool_address?: string | null;
  condition_id?: string | null;
  yes_token_id?: string | null;
  no_token_id?: string | null;
  usdc_address?: string | null;
  is_marked?: boolean;
  // V3 CPMM fields
  cpmm_address?: string | null;
  cpmm_market_id?: string | null;
  contract_version?: "V1" | "V2" | "V3" | null;
  onBookMark?: (save: boolean) => void;
  showSaveButton?: boolean;
  disabled?: boolean;
  selectedCategory?: import("@pronostico-apps/interfaces").MarketCategory | null;
  // Selected share for probability display transformation
  selectedShare?: "YES" | "NO" | null;
}

export interface SingleSelectionTypeProps {
  image: string;
  title: string;
}

export interface MultiSelectionTypeProps {
  image: string;
  title: string;
  multiSelectOptions: MultiSelectOptions[];
}

export interface StreamMarketTypeProps {
  teams: Team[];
  details: string;
}

export interface Team {
  name: string;
  logo: string;
  marketPercentage: number;
}
