import { describe, expect, it } from 'vitest';
import { SourceFetcher } from '../packages/knowledge/src/sources/fetcher.js';
import { KnowledgeSource } from '../packages/types/src/source.js';

describe('SourceFetcher', () => {
    it('fetches source content, computes SHA-256 hash, and constructs KnowledgeDocument', async () => {
        const fetcher = new SourceFetcher();
        const mockSource: KnowledgeSource = {
            id: 'solana-test-source',
            url: 'https://docs.solana.com/cli',
            title: 'Solana CLI Docs Test',
            type: 'official_docs',
            authority: 'official',
            publisher: 'Solana Foundation',
            enabled: true,
        };

        const doc = await fetcher.fetch(mockSource);
        expect(doc).toBeDefined();
        expect(doc.sourceId).toBe('solana-test-source');
        expect(doc.contentHash).toBeDefined();
        expect(doc.contentHash.length).toBe(64); // SHA-256 hex length
        expect(doc.fetchedAt).toBeDefined();
    });
});
