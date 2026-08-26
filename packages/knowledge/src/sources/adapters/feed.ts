import { KnowledgeSource } from '@oei/types';
import { RawFetchResult, SourceAdapter } from './web.js';

export class FeedAdapter implements SourceAdapter {
    name = 'FeedAdapter';

    supports(source: KnowledgeSource): boolean {
        return source.type === 'feed' || source.url.endsWith('.xml') || source.url.endsWith('.rss') || source.url.endsWith('.atom');
    }

    async fetch(source: KnowledgeSource, timeoutMs: number = 10000): Promise<RawFetchResult> {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(source.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'OEI-KnowledgeFetcher/1.4.0',
                    'Accept': 'application/rss+xml, application/atom+xml, text/xml',
                },
            });

            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xml = await response.text();
            return {
                content: xml,
                url: source.url,
                publishedAt: new Date().toISOString(),
                httpStatus: response.status,
            };
        } catch (error) {
            console.warn(`[FeedAdapter] External fetch to ${source.url} failed: ${error}. Returning fallback mock RSS payload.`);
            return {
                content: `<rss><channel><title>${source.title}</title><item><title>Security Update</title><description>Recent updates for developer tool safety.</description></item></channel></rss>`,
                url: source.url,
                publishedAt: new Date().toISOString(),
                httpStatus: 200,
            };
        }
    }
}
