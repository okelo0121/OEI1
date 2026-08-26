import { createHash } from 'crypto';
import { KnowledgeDocument, KnowledgeSource } from '@oei/types';
import { FeedAdapter, GitHubAdapter, SourceAdapter, WebAdapter } from './adapters/index.js';

export class SourceFetcher {
    private adapters: SourceAdapter[];

    constructor(adapters: SourceAdapter[] = [new GitHubAdapter(), new FeedAdapter(), new WebAdapter()]) {
        this.adapters = adapters;
    }

    async fetch(source: KnowledgeSource, timeoutMs: number = 10000): Promise<KnowledgeDocument> {
        const adapter = this.adapters.find((a) => a.supports(source)) || new WebAdapter();

        try {
            const result = await adapter.fetch(source, timeoutMs);

            const contentHash = createHash('sha256')
                .update(result.content || '')
                .digest('hex');

            const documentId = `doc_${source.id}_${contentHash.slice(0, 10)}`;

            const doc: KnowledgeDocument = {
                id: documentId,
                sourceId: source.id,
                url: result.url || source.url,
                title: source.title,
                content: result.content,
                contentHash,
                fetchedAt: new Date().toISOString(),
                publishedAt: result.publishedAt || source.publishedAt || new Date().toISOString(),
                metadata: {
                    ...(source.metadata || {}),
                    adapterUsed: adapter.name,
                    httpStatus: result.httpStatus || 200,
                },
            };

            return doc;
        } catch (error) {
            console.error(`[SourceFetcher] Error fetching source ${source.id} (${source.url}):`, error);
            // Fall back gracefully to return a stub document so pipeline does not crash
            const fallbackContent = `Content fetch failed for source ${source.title} (${source.url}). Error: ${error}`;
            const contentHash = createHash('sha256').update(fallbackContent).digest('hex');

            return {
                id: `doc_err_${source.id}`,
                sourceId: source.id,
                url: source.url,
                title: source.title,
                content: fallbackContent,
                contentHash,
                fetchedAt: new Date().toISOString(),
                metadata: { error: String(error) },
            };
        }
    }
}
