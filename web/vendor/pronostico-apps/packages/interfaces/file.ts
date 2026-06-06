

export interface File {
    alternativeText: string | null;
    caption: string | null;
    createdAt: string;
    documentId: string;
    ext: string;
    folderPath: string;
    formats: string | null;
    hash: string;
    height: string | null;
    id: number;
    locale: string | null;
    mime: string;
    name: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: string | null;
    publishedAt: string;
    size: number;
    updatedAt: string;
    url: string;
    width: string | null;
}