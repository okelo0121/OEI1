import { describe, expect, it } from 'vitest';
import { JsonRepository } from '../packages/knowledge/src/storage/json-repository.js';
import { KnowledgeService } from '../packages/knowledge/src/service.js';

describe('Task 4: Dry-Run Synchronization Tests', () => {
    it('dry-run fetches, normalizes, extracts, and validates without writing to persistent storage', async () => {
        const repo = new JsonRepository('./data');
        const service = new KnowledgeService(undefined, repo);

        const stats = await service.syncSource('git-official-docs', true);

        expect(stats.dryRun).toBe(true);
        expect(stats.sourcesProcessed).toBe(1);
        expect(stats.documentsFetched).toBe(1);
        expect(stats.factsExtracted).toBeGreaterThan(0);
        expect(stats.factsStored).toBe(0); // 0 facts written to storage during dry-run
        expect(stats.extractedFacts?.length).toBeGreaterThan(0);
    });
});
