import { describe, expect, it } from 'vitest';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ConfigService, ExecutionEngine } from '../packages/core/src/index.js';
import { KnowledgeService } from '../packages/knowledge/src/index.js';

describe('OEI CLI Productization — Config & Doctor Services', () => {
    const testConfigPath = join(tmpdir(), `oei-test-config-${Date.now()}.json`);

    it('ConfigService > handles default options and fallback values', () => {
        const service = new ConfigService(testConfigPath);
        expect(service.get('AI_PROVIDER')).toBe('mock');
        expect(service.get('LOG_LEVEL')).toBe('info');
        expect(service.get('NON_EXISTENT_KEY')).toBeUndefined();
    });

    it('ConfigService > persists set values and parses booleans/numbers correctly', () => {
        const service = new ConfigService(testConfigPath);
        service.set('AI_PROVIDER', 'openai');
        service.set('AUTO_CONFIRM', 'true');
        service.set('MAX_ATTEMPTS', '5');

        expect(service.get('AI_PROVIDER')).toBe('openai');
        expect(service.get('AUTO_CONFIRM')).toBe(true);
        expect(service.get('MAX_ATTEMPTS')).toBe(5);

        // Verify re-loading from disk
        const newServiceInstance = new ConfigService(testConfigPath);
        expect(newServiceInstance.get('AI_PROVIDER')).toBe('openai');
        expect(newServiceInstance.get('AUTO_CONFIRM')).toBe(true);
    });

    it('ConfigService > masks sensitive keys in getMaskedList', () => {
        const service = new ConfigService(testConfigPath);
        service.set('AI_API_KEY', 'sk-proj-1234567890abcdef');
        service.set('SECRET_TOKEN', 'token-999');

        const masked = service.getMaskedList();
        expect(masked.AI_API_KEY).not.toBe('sk-proj-1234567890abcdef');
        expect(masked.AI_API_KEY).toContain('****');
        expect(masked.SECRET_TOKEN).not.toBe('token-999');

        // Non-sensitive key should remain unmasked
        expect(masked.AI_PROVIDER).toBe('openai');

        if (existsSync(testConfigPath)) {
            unlinkSync(testConfigPath);
        }
    });

    it('Doctor Diagnostic Checks > verifies Core Engine and Knowledge Store', async () => {
        const kService = new KnowledgeService();
        const engine = new ExecutionEngine(kService);
        const evalRes = await engine.evaluate('git status');

        expect(evalRes.status).toBe('PARSED');
        expect(evalRes.action?.tool).toBe('git');

        const facts = await kService.repository.listFacts();
        expect(facts.length).toBeGreaterThan(0);
    });

    it('Analyze Output Format > separates findings, evidence, and AI explanation boundary', async () => {
        const kService = new KnowledgeService();
        const engine = new ExecutionEngine(kService);
        const result = await engine.evaluate('solana program deploy app.so');

        expect(result.action).toBeDefined();
        expect(result.context).toBeDefined();
        expect(result.riskAssessment).toBeDefined();
        expect(result.recommendation).toBeDefined();
        expect(result.recommendation?.evidence).toBeDefined();
        expect(result.recommendation?.explanation).toBeDefined();
    });
});
