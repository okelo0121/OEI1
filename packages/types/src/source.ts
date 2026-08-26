export type SourceType =
    | 'official_docs'
    | 'release_notes'
    | 'security_advisory'
    | 'official_blog'
    | 'github'
    | 'feed'
    | 'news'
    | 'community';

export type SourceAuthority =
    | 'official'
    | 'trusted'
    | 'community'
    | 'unknown';

export interface KnowledgeSource {
    id: string;
    url: string;
    title: string;
    type: SourceType;
    authority: SourceAuthority;
    publisher: string;
    publishedAt?: string;
    fetchedAt?: string;
    contentHash?: string;
    enabled: boolean;
    metadata?: Record<string, any>;
}
