import { describe, expect, it } from 'vitest';
import { calculateFactConfidence } from '../packages/knowledge/src/validation/confidence.js';
import { FactValidator } from '../packages/knowledge/src/validation/validator.js';
import { KnowledgeDocument, KnowledgeSource } from '../packages/types/src/index.js';

describe('FactValidator & Confidence', () => {
    it('calculates deterministic confidence combining source authority and AI extraction score', () => {
        const officialConf = calculateFactConfidence('official', 0.9, true);
        const communityConf = calculateFactConfidence('community', 0.9, true);

        expect(officialConf).toBeGreaterThan(communityConf);
        expect(officialConf).toBe(0.9); // 0.90 * 0.7 + 0.90 * 0.3 = 0.90
        expect(communityConf).toBe(0.69); // 0.60 * 0.7 + 0.90 * 0.3 = 0.69
    });

    it('validates raw facts and builds KnowledgeFact with source evidence attached', () => {
        const validator = new FactValidator();
        const doc: KnowledgeDocument = {
            id: 'doc_1',
            sourceId: 'src_1',
            url: 'https://docs.solana.com',
            title: 'Solana Docs',
            content: 'Solana CLI v2.0 deprecations sample text.',
            contentHash: 'hash123',
            fetchedAt: new Date().toISOString(),
        };

        const source: KnowledgeSource = {
            id: 'src_1',
            url: 'https://docs.solana.com',
            title: 'Solana Docs',
            type: 'official_docs',
            authority: 'official',
            publisher: 'Solana Labs',
            enabled: true,
        };

        const valResult = validator.validateAndTransform(
            {
                subject: 'solana',
                subjectType: 'cli',
                factType: 'breaking_change',
                statement: 'Deprecates --fee-payer in v2.0',
                impact: 'Breaks legacy deployment scripts',
                severity: 'high',
                snippet: 'Solana CLI v2.0 deprecations sample text.',
                aiConfidence: 0.85,
            },
            doc,
            source
        );

        expect(valResult.valid).toBe(true);
        expect(valResult.fact).toBeDefined();
        expect(valResult.fact?.evidence.sourceUrl).toBe('https://docs.solana.com');
        expect(valResult.fact?.evidence.authority).toBe('official');
        expect(valResult.fact?.evidence.snippet).toBe('Solana CLI v2.0 deprecations sample text.');
    });
});
