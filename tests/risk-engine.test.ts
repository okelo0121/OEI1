import { describe, it, expect } from 'vitest';
import { RiskEngine, RiskReasoner, parseAction, collectContext, assessRisk } from '../packages/core/src/index.js';
import { KnowledgeMatch } from '@oei/types';

describe('Risk Analysis Engine & Risk Scoring', () => {
    const mockMatchCritical: KnowledgeMatch = {
        fact: {
            id: 'fact-crit-1',
            subject: 'solana',
            subjectType: 'cli',
            factType: 'security_issue',
            statement: 'Critical zero-day deployment keypair vulnerability.',
            impact: 'Complete account compromise',
            severity: 'critical',
            affectedVersions: { raw: '< 2.0.0' },
            sourceId: 'solana-official-docs',
            evidence: {
                sourceUrl: 'https://docs.solana.com',
                extractedText: 'zero-day vulnerability',
                confidence: 0.95,
                authority: 'official',
            },
            confidence: 0.95,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        relevanceScore: 0.85,
        matchReasons: ['tool-match', 'operation-match', 'official-source'],
        versionMatch: 'affected',
        authority: 'official',
    };

    const mockMatchMedium: KnowledgeMatch = {
        fact: {
            id: 'fact-med-1',
            subject: 'npm',
            subjectType: 'cli',
            factType: 'compatibility',
            statement: 'Deprecated flag in npm install.',
            impact: 'Warning logs printed',
            severity: 'medium',
            sourceId: 'npm-official-docs',
            evidence: {
                sourceUrl: 'https://docs.npmjs.com',
                extractedText: 'deprecated flag',
                confidence: 0.80,
                authority: 'official',
            },
            confidence: 0.80,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        relevanceScore: 0.60,
        matchReasons: ['tool-match'],
        versionMatch: 'unknown',
        authority: 'official',
    };

    it('produces LOW risk score when no matching facts are found', () => {
        const action = parseAction('cargo build');
        const context = collectContext(action);
        const assessment = RiskEngine.calculate(action, context, []);

        expect(assessment.score).toBeLessThan(25);
        expect(assessment.level).toBe('LOW');
        expect(assessment.score).toBeGreaterThanOrEqual(0);
    });

    it('calculates CRITICAL risk level for critical severity affected fact', () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);
        const assessment = RiskEngine.calculate(action, context, [mockMatchCritical]);

        expect(assessment.score).toBeGreaterThanOrEqual(75);
        expect(assessment.level).toBe('CRITICAL');
        expect(assessment.factors.some(f => f.type === 'affected-version')).toBe(true);
    });

    it('does not inflate score when duplicate matches are passed', () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const singleAssessment = RiskEngine.calculate(action, context, [mockMatchCritical]);
        const duplicateAssessment = RiskEngine.calculate(action, context, [mockMatchCritical, mockMatchCritical, mockMatchCritical]);

        expect(duplicateAssessment.score).toBe(singleAssessment.score);
        expect(duplicateAssessment.factors.length).toBe(singleAssessment.factors.length);
    });

    it('strictly clamps final risk score between 0 and 100', () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const multipleHighMatches = [mockMatchCritical, mockMatchCritical, mockMatchMedium];
        const assessment = RiskEngine.calculate(action, context, multipleHighMatches);

        expect(assessment.score).toBeLessThanOrEqual(100);
        expect(assessment.score).toBeGreaterThanOrEqual(0);
    });

    it('ensures deterministic repeatability for identical inputs', () => {
        const action = parseAction('npm install express');
        const context = collectContext(action);

        const eval1 = RiskEngine.calculate(action, context, [mockMatchMedium]);
        const eval2 = RiskEngine.calculate(action, context, [mockMatchMedium]);

        expect(eval1.score).toBe(eval2.score);
        expect(eval1.level).toBe(eval2.level);
        expect(eval1.factors.length).toBe(eval2.factors.length);
    });

    it('integrates RiskReasoner to produce RiskExplanation without altering risk score', async () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const assessment = await assessRisk(action, context, [mockMatchCritical], { includeAiReasoner: true });

        expect(assessment.explanation).toBeDefined();
        expect(assessment.explanation?.summary).toContain('CRITICAL risk');
        expect(assessment.explanation?.evidenceReferences).toContain('https://docs.solana.com');
        expect(assessment.level).toBe('CRITICAL');
    });

    it('operates offline using MockAIProvider without throwing errors', async () => {
        const action = parseAction('git push origin main');
        const context = collectContext(action);

        const reasoner = new RiskReasoner();
        const base = RiskEngine.calculate(action, context, [mockMatchMedium]);
        const explanation = await reasoner.explain({
            action,
            context,
            riskAssessment: base,
            knowledgeMatches: [mockMatchMedium],
        });

        expect(explanation.summary).toBeDefined();
        expect(explanation.impact).toBeDefined();
        expect(explanation.reasoning).toBeDefined();
    });
});
