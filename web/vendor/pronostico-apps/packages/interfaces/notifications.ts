import { Market } from "./markets";

export interface NotificationLocaleData {
    title: string;
    message: string;
    marketTitle?: string;
    variables?: Record<string, string>;
}

export interface Notification {
    createdAt: string;
    documentId: string;
    id: number;
    is_read: boolean;
    locale: string | null;
    notification: {
        createdAt: string;
        documentId: string;
        id: number;
        locale: string | null;
        market: Pick<Market, "id" | "documentId" | "title" | "description" | "question"> | null;
        message: string | null;
        payload: any | null;
        publishedAt: string;
        title: string | null;
        type: string;
        updatedAt: string;
        // Locale-aware display data resolved at display-time
        localeData?: NotificationLocaleData | null;
    };
    publishedAt: string;
    read_at: string | null;
    updatedAt: string;
}

export interface GetNotificationsByTraderResponse {
    receipts: Notification[];
    unread_notifications: number;
    pagination: {
        page: number;
        pageSize: number;
        count: number;
    };
}
