import { describe, expect, it } from 'vitest';
import { JsonRepository } from '../packages/knowledge/src/storage/json-repository.js';
import { KnowledgeService } from '../packages/knowledge/src/service.js';

describe('Task 10: Duplicate Handling & Idempotency', () => {
    it('syncing the exact same source twice does not create duplicate fact records', async () => {
        const repo = new JsonRepository('./data');
        const service = new KnowledgeService(undefined, repo);

        // First sync
        const stats1 = await service.syncSource('solana-cli-docs');
        const factsAfterFirstSync = await service.searchFacts('solana');

        // Second sync on same source
        const stats2 = await service.syncSource('solana-cli-docs');
        const factsAfterSecondSync = await service.searchFacts('solana');

        expect(stats1.factsStored).toBeGreaterThan(0);
        expect(stats2.factsStored).toBe(stats1.factsStored);

        // Count facts with exact same sourceId
        const solanaFactsFirst = factsAfterFirstSync.filter((f) => f.sourceId === 'solana-cli-docs');
        const solanaFactsSecond = factsAfterSecondSync.filter((f) => f.sourceId === 'solana-cli-docs');

        // Facts with solana-cli-docs sourceId should be identical in length, not doubled
        expect(solanaFactsSecond.length).toBe(solanaFactsFirst.length);
    });
});
