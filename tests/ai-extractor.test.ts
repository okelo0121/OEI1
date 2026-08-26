import { describe, expect, it } from 'vitest';
import { AIExtractor, MockAIProvider } from '../packages/ai/src/index.js';
import { KnowledgeDocument } from '../packages/types/src/knowledge.js';

describe('AIExtractor', () => {
    it('extracts structured raw facts validated through Zod schema', async () => {
        const extractor = new AIExtractor(new MockAIProvider());
        const doc: KnowledgeDocument = {
            id: 'doc_solana_v2',
            sourceId: 'solana-cli-docs',
            url: 'https://docs.solana.com/cli',
            title: 'Solana CLI v2.0 Breaking Changes',
            content: 'Solana CLI v2.0 deprecates legacy --fee-payer flags. Automated scripts must pass --signer arguments.',
            contentHash: 'hash_solana_123',
            fetchedAt: new Date().toISOString(),
        };

        const result = await extractor.extract(doc);
        expect(result.facts.length).toBeGreaterThan(0);

        const fact = result.facts[0];
        expect(fact.subject).toBe('solana');
        expect(fact.factType).toBe('breaking_change');
        expect(fact.snippet).toBeDefined();
        expect(fact.aiConfidence).toBeGreaterThan(0.5);
    });
});
