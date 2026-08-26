import { describe, it, expect } from 'vitest';
import { parseAction, collectContext } from '../packages/core/src/index.js';
import { KnowledgeMatcher } from '../packages/knowledge/src/index.js';
import { KnowledgeFact } from '@oei/types';


describe('Knowledge Retrieval & Fact Matching Engine', () => {
    const mockFacts: KnowledgeFact[] = [
        {
            id: 'fact-solana-1',
            subject: 'solana',
            subjectType: 'cli',
            factType: 'security_issue',
            statement: 'Deploying Solana program requires verified deployment keypair and program ID check.',
            impact: 'Unauthorized deployment or program overwrite',
            severity: 'critical',
            affectedVersions: { raw: '< 2.0.0', maxVersion: '2.0.0' },
            evidence: {
                sourceUrl: 'https://docs.solana.com/cli/deploy',
                extractedText: 'Deploying solana program...',
                confidence: 0.95,
                authority: 'official',
            },
            sourceId: 'solana-official-docs',
            confidence: 0.95,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        {
            id: 'fact-git-1',
            subject: 'git',
            subjectType: 'cli',
            factType: 'best_practice',
            statement: 'Pushing directly to main branch without pull request bypasses branch protection rules.',
            impact: 'Unreviewed production code deployment',
            severity: 'high',
            evidence: {
                sourceUrl: 'https://git-scm.com/docs/git-push',
                extractedText: 'git push origin main...',
                confidence: 0.90,
                authority: 'official',
            },
            sourceId: 'git-official-docs',
            confidence: 0.90,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        {
            id: 'fact-npm-1',
            subject: 'npm',
            subjectType: 'cli',
            factType: 'security_issue',
            statement: 'Installing unvetted third-party npm package express without lockfile validation.',
            impact: 'Supply chain vulnerability risk',
            severity: 'medium',
            affectedVersions: { raw: '*' },
            evidence: {
                sourceUrl: 'https://docs.npmjs.com/cli',
                extractedText: 'npm install...',
                confidence: 0.85,
                authority: 'official',
            },
            sourceId: 'npm-official-docs',
            confidence: 0.85,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
    ];

    const matcher = new KnowledgeMatcher();

    it('matches Solana program deploy command to relevant Solana fact', () => {
        const action = parseAction('solana program deploy target/deploy/app.so');
        const context = collectContext(action);

        const matches = matcher.match(mockFacts, action, context);

        expect(matches.length).toBeGreaterThan(0);
        const topMatch = matches[0];
        expect(topMatch.fact.id).toBe('fact-solana-1');
        expect(topMatch.matchReasons).toContain('tool-match');
        expect(topMatch.matchReasons).toContain('operation-match');
        expect(topMatch.authority).toBe('official');
        expect(topMatch.relevanceScore).toBeGreaterThan(0.5);
    });

    it('matches git push command to Git fact', () => {
        const action = parseAction('git push origin main');
        const context = collectContext(action);

        const matches = matcher.match(mockFacts, action, context);

        expect(matches.length).toBeGreaterThan(0);
        const topMatch = matches[0];
        expect(topMatch.fact.id).toBe('fact-git-1');
        expect(topMatch.matchReasons).toContain('tool-match');
        expect(topMatch.matchReasons).toContain('operation-match');
    });

    it('matches npm install command to npm fact', () => {
        const action = parseAction('npm install express');
        const context = collectContext(action);

        const matches = matcher.match(mockFacts, action, context);

        expect(matches.length).toBeGreaterThan(0);
        const topMatch = matches[0];
        expect(topMatch.fact.id).toBe('fact-npm-1');
        expect(topMatch.matchReasons).toContain('tool-match');
    });

    it('preserves provenance fields untouched', () => {
        const action = parseAction('solana program deploy target/deploy/app.so');
        const context = collectContext(action);
        const matches = matcher.match(mockFacts, action, context);

        const m = matches[0];
        expect(m.fact.sourceId).toBe('solana-official-docs');
        expect(m.fact.evidence.sourceUrl).toBe('https://docs.solana.com/cli/deploy');
        expect(m.fact.evidence.authority).toBe('official');
        expect(m.fact.confidence).toBe(0.95);
    });

    it('returns empty matches for unknown command with no facts', () => {
        const action = parseAction('foobar --do-something');
        const context = collectContext(action);
        const matches = matcher.match(mockFacts, action, context);

        expect(matches.length).toBe(0);
    });
});
