import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AIProvider, LocalAIProvider, MockAIProvider, GenericAIProvider } from '../packages/ai/src/providers/provider.js';
import { KnowledgeDocument, KnowledgeSource } from '../packages/types/src/index.js';
import { FactValidator } from '../packages/knowledge/src/validation/validator.js';

describe('Task 8: Provider Independence Tests', () => {
    const fixturePath = join(__dirname, 'fixtures', 'solana-official-docs.txt');
    const fixtureContent = readFileSync(fixturePath, 'utf-8');

    const sampleDoc: KnowledgeDocument = {
        id: 'doc_solana_fixture',
        sourceId: 'solana-cli-docs',
        url: 'https://docs.solana.com/cli',
        title: 'Solana CLI Tool Suite Documentation',
        content: fixtureContent,
        contentHash: 'hash_solana_fixture_123',
        fetchedAt: new Date().toISOString(),
    };

    const sampleSource: KnowledgeSource = {
        id: 'solana-cli-docs',
        url: 'https://docs.solana.com/cli',
        title: 'Solana CLI Official Documentation',
        type: 'official_docs',
        authority: 'official',
        publisher: 'Solana Foundation',
        enabled: true,
    };

    const providers: { name: string; instance: AIProvider }[] = [
        { name: 'MockAIProvider', instance: new MockAIProvider() },
        { name: 'LocalAIProvider', instance: new LocalAIProvider('http://localhost:9999/v1/chat/completions') }, // Will fall back gracefully
        { name: 'GenericAIProvider', instance: new GenericAIProvider('invalid_api_key') }, // Will fall back gracefully
    ];

    providers.forEach(({ name, instance }) => {
        it(`extracts structured facts using ${name} behind standard AIProvider interface`, async () => {
            const result = await instance.extractKnowledge(sampleDoc);
            expect(result).toBeDefined();
            expect(result.facts.length).toBeGreaterThan(0);

            const validator = new FactValidator();
            const valResult = validator.validateAndTransform(result.facts[0], sampleDoc, sampleSource);

            expect(valResult.valid).toBe(true);
            expect(valResult.fact).toBeDefined();
            expect(valResult.fact?.evidence.sourceUrl).toBe('https://docs.solana.com/cli');
            expect(valResult.fact?.evidence.authority).toBe('official');
        });
    });
});
