import { describe, expect, it } from 'vitest';
import { JsonRepository } from '../packages/knowledge/src/storage/json-repository.js';
import { KnowledgeRetriever } from '../packages/knowledge/src/retrieval/retriever.js';
import { KnowledgeService } from '../packages/knowledge/src/service.js';

describe('End-to-End Knowledge Pipeline & Storage', () => {
    it('executes full sync pipeline: Source -> Fetch -> Normalize -> Extract -> Validate -> Store -> Search', async () => {
        const repo = new JsonRepository('./data');
        const service = new KnowledgeService(undefined, repo);

        // Run sync on official Solana docs source
        const stats = await service.syncSource('solana-cli-docs');

        expect(stats.sourcesProcessed).toBe(1);
        expect(stats.factsStored).toBeGreaterThan(0);

        // Retrieve facts using search
        const retriever = new KnowledgeRetriever(repo);
        const searchResults = await retriever.search('solana');

        expect(searchResults.length).toBeGreaterThan(0);
        const fact = searchResults[0];
        expect(fact.subject).toContain('solana');
        expect(fact.evidence.sourceId).toBe('solana-cli-docs');
    });
});
