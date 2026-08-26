import { describe, it, expect } from 'vitest';
import { RecommendationPolicy, RemediationBuilder, RecommendationExplainer, parseAction, collectContext, RiskEngine, generateRecommendation } from '../packages/core/src/index.js';
import { KnowledgeMatch } from '@oei/types';

describe('Recommendation Engine & Actionable Remediation', () => {
    const mockCriticalAffectedMatch: KnowledgeMatch = {
        fact: {
            id: 'fact-crit-1',
            subject: 'solana',
            subjectType: 'cli',
            factType: 'security_issue',
            statement: 'Critical zero-day private key compromise vulnerability.',
            impact: 'Complete wallet drain',
            severity: 'critical',
            affectedVersions: { raw: '< 2.0.0' },
            sourceId: 'solana-official-docs',
            evidence: {
                sourceUrl: 'https://docs.solana.com/security',
                extractedText: 'zero-day vulnerability',
                confidence: 0.95,
                authority: 'official',
            },
            confidence: 0.95,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        relevanceScore: 0.90,
        matchReasons: ['tool-match', 'official-source'],
        versionMatch: 'affected',
        authority: 'official',
    };

    const mockMediumMatch: KnowledgeMatch = {
        fact: {
            id: 'fact-med-1',
            subject: 'npm',
            subjectType: 'cli',
            factType: 'compatibility',
            statement: 'Deprecated flag in npm install.',
            impact: 'Warning logs',
            severity: 'medium',
            sourceId: 'npm-official-docs',
            evidence: {
                sourceUrl: 'https://docs.npmjs.com',
                extractedText: 'deprecated flag',
                confidence: 0.85,
                authority: 'official',
            },
            confidence: 0.85,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        relevanceScore: 0.65,
        matchReasons: ['tool-match'],
        versionMatch: 'unknown',
        authority: 'official',
    };

    it('returns ALLOW action for safe command with clean workspace and no advisories', () => {
        const action = parseAction('cargo build');
        const context = collectContext(action);
        context.git.workingTreeClean = true;

        const risk = RiskEngine.calculate(action, context, []);
        const rec = RecommendationPolicy.evaluate(action, context, [], risk);

        expect(rec.action).toBe('ALLOW');
        expect(rec.urgency).toBe('low');
        expect(rec.reasons.length).toBeGreaterThan(0);
    });

    it('returns SUGGESTION action for dirty Git tree without critical security advisories', () => {
        const action = parseAction('cargo build');
        const context = collectContext(action);
        context.git.workingTreeClean = false;

        const risk = RiskEngine.calculate(action, context, []);
        const rec = RecommendationPolicy.evaluate(action, context, [], risk);

        expect(rec.action).toBe('SUGGESTION');
        expect(rec.urgency).toBe('medium');
        expect(rec.remediation.some(s => s.safety === 'SAFE' && s.command === 'git status')).toBe(true);
        expect(rec.remediation.some(s => s.safety === 'POTENTIALLY_STATE_CHANGING')).toBe(true);
    });

    it('returns WARN action for affected version match', () => {
        const action = parseAction('npm install express');
        const context = collectContext(action);
        const affectedMatch = { ...mockMediumMatch, versionMatch: 'affected' as const };

        const risk = RiskEngine.calculate(action, context, [affectedMatch]);
        const rec = RecommendationPolicy.evaluate(action, context, [affectedMatch], risk);

        expect(rec.action).toBe('WARN');
        expect(rec.urgency).toBe('high');
    });

    it('returns BLOCK action exclusively for confirmed critical security advisories', () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const risk = RiskEngine.calculate(action, context, [mockCriticalAffectedMatch]);
        const rec = RecommendationPolicy.evaluate(action, context, [mockCriticalAffectedMatch], risk);

        expect(rec.action).toBe('BLOCK');
        expect(rec.urgency).toBe('immediate');
    });

    it('REGRESSION TEST: dirty Git tree + missing CLI + deployment does NOT falsely produce BLOCK', () => {
        const action = parseAction('solana program deploy target/deploy/app.so');
        const context = collectContext(action);
        context.git.workingTreeClean = false;
        (context.runtime as any).solana = { available: false };

        const risk = RiskEngine.calculate(action, context, [mockMediumMatch]);
        const rec = RecommendationPolicy.evaluate(action, context, [mockMediumMatch], risk);

        expect(rec.action).not.toBe('BLOCK');
        expect(risk.level).not.toBe('CRITICAL');
        expect(risk.score).toBeLessThan(75);
    });

    it('classifies remediation command safety into SAFE vs POTENTIALLY_STATE_CHANGING', () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);
        context.git.workingTreeClean = false;

        const risk = RiskEngine.calculate(action, context, [mockCriticalAffectedMatch]);
        const steps = RemediationBuilder.build(action, context, [mockCriticalAffectedMatch], risk);

        const safeSteps = steps.filter(s => s.safety === 'SAFE');
        const mutatingSteps = steps.filter(s => s.safety === 'POTENTIALLY_STATE_CHANGING');

        expect(safeSteps.length).toBeGreaterThan(0);
        expect(mutatingSteps.length).toBeGreaterThan(0);
    });

    it('preserves evidence provenance traceability in recommendation output', () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const risk = RiskEngine.calculate(action, context, [mockCriticalAffectedMatch]);
        const rec = RecommendationPolicy.evaluate(action, context, [mockCriticalAffectedMatch], risk);

        expect(rec.evidence.length).toBe(1);
        expect(rec.evidence[0].sourceId).toBe('solana-official-docs');
        expect(rec.evidence[0].sourceUrl).toBe('https://docs.solana.com/security');
        expect(rec.evidence[0].authority).toBe('official');
    });

    it('operates offline using MockAIProvider without throwing errors', async () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const risk = RiskEngine.calculate(action, context, [mockCriticalAffectedMatch]);
        const rec = await generateRecommendation(action, context, [mockCriticalAffectedMatch], risk, { includeAiExplainer: true });

        expect(rec.action).toBe('BLOCK');
        expect(rec.explanation).toBeDefined();
        expect(rec.explanation?.summary).toContain('BLOCK');
    });
});
