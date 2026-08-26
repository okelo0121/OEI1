import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { ExecutionGateRunner, SafeCommandParser, OEI_EXIT_CODES, parseAction, collectContext, RiskEngine, RecommendationPolicy } from '../packages/core/src/index.js';
import { KnowledgeMatch } from '@oei/types';

describe('Execution Interceptor & Gateways (oei exec)', () => {
    const testAuditPath = join(process.cwd(), '.oei', 'test-audit.jsonl');

    beforeEach(() => {
        if (existsSync(testAuditPath)) {
            try { unlinkSync(testAuditPath); } catch { }
        }
    });

    afterEach(() => {
        if (existsSync(testAuditPath)) {
            try { unlinkSync(testAuditPath); } catch { }
        }
    });

    const mockCriticalMatch: KnowledgeMatch = {
        fact: {
            id: 'fact-crit-exec',
            subject: 'solana',
            subjectType: 'cli',
            factType: 'security_issue',
            statement: 'Critical deployment vulnerability.',
            impact: 'Account compromise',
            severity: 'critical',
            affectedVersions: { raw: '< 2.0.0' },
            sourceId: 'solana-official-docs',
            evidence: {
                sourceUrl: 'https://docs.solana.com',
                extractedText: 'critical issue',
                confidence: 0.95,
                authority: 'official',
            },
            confidence: 0.95,
            extractedAt: '2026-08-10T00:00:00Z',
            updatedAt: '2026-08-10T00:00:00Z',
        },
        relevanceScore: 0.90,
        matchReasons: ['tool-match'],
        versionMatch: 'affected',
        authority: 'official',
    };

    it('safely parses executable and arguments while intercepting unsafe shell operators', () => {
        const parsedNormal = SafeCommandParser.parse('git status');
        expect(parsedNormal.executable).toBe('git');
        expect(parsedNormal.args).toEqual(['status']);
        expect(parsedNormal.hasShellOperators).toBe(false);

        const parsedOperator = SafeCommandParser.parse('git status && rm -rf /');
        expect(parsedOperator.hasShellOperators).toBe(true);
        expect(parsedOperator.unsupportedShellOperator).toBe('&&');
    });

    it('blocks execution with exit code 5 when unsupported shell operator is passed', async () => {
        const action = parseAction('npm test && malicious-command');
        const context = collectContext(action);
        const risk = RiskEngine.calculate(action, context, []);
        const rec = RecommendationPolicy.evaluate(action, context, [], risk);

        const res = await ExecutionGateRunner.process('npm test && malicious-command', action, risk, rec, {
            auditLogPath: testAuditPath,
        });

        expect(res.executed).toBe(false);
        expect(res.exitCode).toBe(OEI_EXIT_CODES.UNSUPPORTED_SHELL_COMMAND);
        expect(res.command.hasShellOperators).toBe(true);
    });

    it('executes ALLOWED harmless command automatically and propagates exit code 0', async () => {
        const action = parseAction('node --version');
        const context = collectContext(action);
        context.git.workingTreeClean = true;

        const risk = RiskEngine.calculate(action, context, []);
        const rec = RecommendationPolicy.evaluate(action, context, [], risk);

        const res = await ExecutionGateRunner.process('node --version', action, risk, rec, {
            auditLogPath: testAuditPath,
        });

        expect(res.decision.decision).toBe('ALLOW');
        expect(res.executed).toBe(true);
        expect(res.exitCode).toBe(0);
    });

    it('NEVER executes command when gate decision is BLOCK', async () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const risk = RiskEngine.calculate(action, context, [mockCriticalMatch]);
        const rec = RecommendationPolicy.evaluate(action, context, [mockCriticalMatch], risk);

        expect(rec.action).toBe('BLOCK');

        const res = await ExecutionGateRunner.process('solana program deploy app.so', action, risk, rec, {
            auditLogPath: testAuditPath,
        });

        expect(res.executed).toBe(false);
        expect(res.exitCode).toBe(OEI_EXIT_CODES.BLOCKED_BY_POLICY);
    });

    it('NEVER bypasses BLOCK even when autoConfirm / --yes is passed', async () => {
        const action = parseAction('solana program deploy app.so');
        const context = collectContext(action);

        const risk = RiskEngine.calculate(action, context, [mockCriticalMatch]);
        const rec = RecommendationPolicy.evaluate(action, context, [mockCriticalMatch], risk);

        const res = await ExecutionGateRunner.process('solana program deploy app.so', action, risk, rec, {
            autoConfirm: true,
            auditLogPath: testAuditPath,
        });

        expect(res.executed).toBe(false);
        expect(res.exitCode).toBe(OEI_EXIT_CODES.BLOCKED_BY_POLICY);
    });

    it('NEVER spawns process when --dry-run is active', async () => {
        const action = parseAction('node --version');
        const context = collectContext(action);
        context.git.workingTreeClean = true;

        const risk = RiskEngine.calculate(action, context, []);
        const rec = RecommendationPolicy.evaluate(action, context, [], risk);

        const res = await ExecutionGateRunner.process('node --version', action, risk, rec, {
            dryRun: true,
            auditLogPath: testAuditPath,
        });

        expect(res.dryRun).toBe(true);
        expect(res.executed).toBe(false);
        expect(res.exitCode).toBe(0);
    });

    it('writes audit logs to audit.jsonl without exposing secret environment variables', async () => {
        const action = parseAction('git status');
        const context = collectContext(action);
        const risk = RiskEngine.calculate(action, context, []);
        const rec = RecommendationPolicy.evaluate(action, context, [], risk);

        await ExecutionGateRunner.process('git status', action, risk, rec, {
            auditLogPath: testAuditPath,
        });

        expect(existsSync(testAuditPath)).toBe(true);
        const logContent = readFileSync(testAuditPath, 'utf-8');
        expect(logContent).toContain('"rawCommand":"git status"');
        expect(logContent).not.toContain('SECRET');
        expect(logContent).not.toContain('API_KEY');
    });
});
