import { SourceAuthority } from './source.js';

export interface Evidence {
    sourceId: string;
    sourceUrl: string;
    sourceTitle: string;
    contentHash: string;
    snippet: string;
    publishedAt?: string;
    authority: SourceAuthority;
}
