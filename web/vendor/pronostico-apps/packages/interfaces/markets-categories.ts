export interface MarketCategoriesResponse {
  data: MarketCategory[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface MarketCategory {
  id: number;
  documentId: string;
  image: {
    id: number;
    documentId: string;
    url: string;
  };
  name: string;
  order: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  unseenMarkets?: number;
  visible_to_creators?: boolean;
}
