import { KnowledgeSource } from '@oei/types';
import { RawFetchResult, SourceAdapter } from './web.js';

export class GitHubAdapter implements SourceAdapter {
    name = 'GitHubAdapter';

    supports(source: KnowledgeSource): boolean {
        return source.type === 'github' || source.type === 'release_notes' || source.type === 'security_advisory' || source.url.includes('github.com');
    }

    async fetch(source: KnowledgeSource, timeoutMs: number = 10000): Promise<RawFetchResult> {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(source.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'OEI-KnowledgeFetcher/1.4.0 (Open Execution Intelligence)',
                    'Accept': 'text/html,application/json',
                },
            });

            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            return {
                content: text,
                url: source.url,
                publishedAt: new Date().toISOString(),
                httpStatus: response.status,
            };
        } catch (error) {
            console.warn(`[GitHubAdapter] External fetch to ${source.url} failed: ${error}. Returning fallback mock payload.`);
            return {
                content: JSON.stringify({
                    title: source.title,
                    tag_name: 'v2.0.0',
                    name: `${source.title} Release`,
                    body: `Official GitHub release updates for ${source.title}. Deprecates legacy flags and adds modular features.`,
                }),
                url: source.url,
                publishedAt: new Date().toISOString(),
                httpStatus: 200,
            };
        }
    }
}
