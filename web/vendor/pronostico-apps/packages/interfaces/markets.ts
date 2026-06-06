import { MarketCategory } from "./markets-categories";
import { MarketTag } from "./market-tags";

export enum MarketType {
  BINARY = "BINARY",
  MULTIPLE = "MULTIPLE",
  SCALAR = "SCALAR",
}

export enum Region {
  Global = "Global",
  Latinoamerica = "Latinoamerica",
  Norteamerica = "Norteamerica",
  Europa = "Europa",
  Eurasia = "Eurasia",
  OrienteMedio = "Oriente Medio",
  Africa = "Africa",
  Asia = "Asia",
  Oceania = "Oceania",
  Antartida = "Antartida",
}

export enum SubRegion {
  Sudamerica = "Sudamérica",
  Centroamerica = "Centroamérica",
  Caribe = "Caribe",
  AmericaDelNorte = "América del Norte",
  EuropaOccidental = "Europa Occidental",
  EuropaOriental = "Europa Oriental",
  EuropaDelNorte = "Europa del Norte",
  EuropaDelSur = "Europa del Sur",
  Caucaso = "Cáucaso",
  AsiaCentral = "Asia Central",
  AsiaOriental = "Asia Oriental",
  SudesteAsiatico = "Sudeste Asiático",
  AsiaMeridional = "Asia Meridional",
  OrienteMedioYNorteDeAfrica = "Oriente Medio y Norte de África (MENA)",
  AfricaDelNorte = "África del Norte",
  AfricaOccidental = "África Occidental",
  AfricaCentral = "África Central",
  AfricaOriental = "África Oriental",
  AfricaAustral = "África Austral",
  AustraliaYNuevaZelanda = "Australia y Nueva Zelanda",
  Melanesia = "Melanesia",
  Micronesia = "Micronesia",
  Polinesia = "Polinesia",
  Global = "Global",
}

export enum Language {
  Espanol = "es",
  Portuguese = "pt",
  English = "en",
}

export enum ResolutionMethod {
  MANUAL = "MANUAL",
  AUTO = "AUTO",
  ORACLE = "ORACLE",
  HYBRID = "HYBRID",
}

export enum OnAmbiguity {
  VOID = "VOID",
  EXTEND = "EXTEND",
  RESOLVE_YES = "RESOLVE_YES",
  RESOLVE_NO = "RESOLVE_NO",
  PAUSE = "PAUSE",
}

export enum Visibility {
  PUBLIC = "PUBLIC",
  UNLISTED = "UNLISTED",
  PRIVATE = "PRIVATE",
  INTERNAL = "INTERNAL",
}

export enum State {
  DRAFT = "DRAFT",
  REVIEW = "REVIEW",
  REVIEWED = "REVIEWED",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  ARCHIEVED = "ARCHIEVED",
  CLOSED = "CLOSED",
  PAUSED = "PAUSED",
  RESOLVED = "RESOLVED",
  VOIDED = "VOIDED",
}
export interface CreateMarketRequest {
  market_id: string;
  title: string;
  question: string;
  description: string;
  market_type: MarketType;
  category: string;
  tags: string[];
  open_time_utc: string;
  close_time_utc: string;
  resolution_time_utc: string;
  resolution_rules: string;
  sources: string;
  visibility: Visibility | "";
  state: State;
  country: string;
  region: string;
  sub_region: string;
  language: string;
  internal_notes: string;
  image_file: File | null;
  image_preview: string;
  image_url: string;
  highlighted: boolean;
  why_choose_no: string;
  why_choose_yes: string;
}
export interface Market {
  id: number;
  documentId: string;
  market_id: string;
  title: string;
  question: string | null;
  description: string | null;
  market_type: MarketType;
  image_url: string | null;
  region: Region | null;
  sub_region: SubRegion | null;
  language: Language | null;
  open_time_utc: string | null; // ISO date string
  close_time_utc: string | null;
  resolution_time_utc: string | null;
  resolution_rules: string | null;
  sources: string | null;
  resolution_method: ResolutionMethod | null;
  on_ambiguity: OnAmbiguity | null;
  visibility: Visibility | null;
  state: State | null;
  internal_notes: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  country: string | null; // ISO alpha-2 code (ej. "US", "NI")
  tags?: Array<Pick<MarketTag, "id" | "name" | "documentId">> | null;
  category?: Pick<MarketCategory, "id" | "name" | "documentId" | "image" | "type"> | null;
  tag?: Pick<MarketTag, "id" | "name" | "documentId"> | null;
  // Blockchain fields for YES/NO trading
  pool_address?: string | null;
  condition_id?: string | null;
  yes_token_id?: string | null;
  no_token_id?: string | null;
  usdc_address?: string | null;
  cpmm_address?: string | null;
  cpmm_market_id?: string | null;
  payment_schedule?: PaymentSchedule | null;
  volume?: string | null;
  is_marked?: boolean;
  resolution_result?: "YES" | "NO" | null;
  image?: {
    url: string;
    id: number;
    documentId: string;
  } | null;
  // V2/V3 fields
  contract_version?: "V1" | "V2" | "V3" | "V4" | null;
  highlighted?: boolean | null;
  why_choose_no?: string | null;
  why_choose_yes?: string | null;
  creator_wallet?: string | null;
  // Creador del mercado (resuelto via LEFT JOIN a traders o populate en controller)
  creator?: {
    user_name?: string;
    avatar?: { url?: string };
  } | null;
  liquidity_status?: "empty" | "added" | "removed" | null;
  liquidity_provider?: string | null;
  chart?: MarketChart[] | null;
  type: string;
  is_seen: boolean;
}

interface MarketChart {
  x: string;
  y: number;
}

export interface PaymentSchedule {
  id: number;
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string | null;
  payment_steps: Array<{
    id: number;
    documentId: string;
    order: number;
    title: string;
    description: string;
    is_completed: boolean;
  }>;
}

export interface MarketsResponse {
  data: Market[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
