import { describe, it, expect } from 'vitest';
import { ActionParser, ActionNormalizer, ActionValidator, parseAction, validateAction } from '../packages/core/src/index.js';

describe('Action Parser & Command Model', () => {
    describe('Representative CLI Commands', () => {
        it('parses Solana program deploy command correctly', () => {
            const raw = 'solana program deploy target/deploy/app.so';
            const action = parseAction(raw);

            expect(action.rawCommand).toBe(raw);
            expect(action.tool).toBe('solana');
            expect(action.operation).toBe('program deploy');
            expect(action.category).toBe('deployment');
            expect(action.target).toBe('target/deploy/app.so');
            expect(action.intent).toBe('execute');
            expect(action.confidence).toBe(1.0);
        });

        it('parses git push origin main command correctly', () => {
            const raw = 'git push origin main';
            const action = parseAction(raw);

            expect(action.rawCommand).toBe(raw);
            expect(action.tool).toBe('git');
            expect(action.operation).toBe('push');
            expect(action.category).toBe('git');
            expect(action.target).toBe('origin/main');
            expect(action.intent).toBe('execute');
            expect(action.confidence).toBe(1.0);
        });

        it('parses git pull origin main command correctly', () => {
            const raw = 'git pull origin main';
            const action = parseAction(raw);

            expect(action.rawCommand).toBe(raw);
            expect(action.tool).toBe('git');
            expect(action.operation).toBe('pull');
            expect(action.category).toBe('git');
            expect(action.target).toBe('origin/main');
            expect(action.intent).toBe('execute');
            expect(action.confidence).toBe(1.0);
        });

        it('parses npm install express command correctly', () => {
            const raw = 'npm install express';
            const action = parseAction(raw);

            expect(action.rawCommand).toBe(raw);
            expect(action.tool).toBe('npm');
            expect(action.operation).toBe('install');
            expect(action.category).toBe('package-management');
            expect(action.target).toBe('express');
            expect(action.intent).toBe('execute');
            expect(action.confidence).toBe(1.0);
        });

        it('parses npm audit command correctly', () => {
            const raw = 'npm audit';
            const action = parseAction(raw);

            expect(action.rawCommand).toBe(raw);
            expect(action.tool).toBe('npm');
            expect(action.operation).toBe('audit');
            expect(action.category).toBe('package-management');
            expect(action.intent).toBe('execute');
            expect(action.confidence).toBe(1.0);
        });

        it('parses cargo build command correctly', () => {
            const raw = 'cargo build';
            const action = parseAction(raw);

            expect(action.rawCommand).toBe(raw);
            expect(action.tool).toBe('cargo');
            expect(action.operation).toBe('build');
            expect(action.category).toBe('build');
            expect(action.intent).toBe('execute');
            expect(action.confidence).toBe(1.0);
        });
    });

    describe('Flags, Options, Quotes, and File Paths', () => {
        it('supports command flags and options correctly', () => {
            const action = parseAction('npm install express --save-dev');
            expect(action.tool).toBe('npm');
            expect(action.operation).toBe('install');
            expect(action.target).toBe('express');
            expect(action.metadata.flags).toContain('--save-dev');
        });

        it('supports quoted arguments correctly', () => {
            const action = parseAction('git commit -m "feat: add action parser"');
            expect(action.tool).toBe('git');
            expect(action.operation).toBe('commit');
            expect(action.target).toBe('feat: add action parser');
            expect(action.metadata.options['-m']).toBe('feat: add action parser');
        });

        it('supports file paths as targets', () => {
            const action = parseAction('solana program deploy ./dist/target/deploy/app.so');
            expect(action.tool).toBe('solana');
            expect(action.operation).toBe('program deploy');
            expect(action.target).toBe('./dist/target/deploy/app.so');
        });
    });

    describe('Unknown and Malformed Commands', () => {
        it('returns low confidence explicit unknown for unrecognized commands', () => {
            const action = parseAction('foobar --do-something');
            expect(action.tool).toBe('unknown');
            expect(action.operation).toBe('unknown');
            expect(action.category).toBe('unknown');
            expect(action.intent).toBe('unknown');
            expect(action.confidence).toBe(0.0);
        });

        it('gracefully handles malformed unclosed quotes', () => {
            const action = parseAction('git push "unclosed quote');
            expect(action.metadata.isMalformed).toBe(true);
            expect(action.confidence).toBe(0.0);
            expect(action.metadata.malformedReason).toBeDefined();
        });

        it('handles empty or whitespace command strings', () => {
            const action1 = parseAction('');
            expect(action1.metadata.isMalformed).toBe(true);
            expect(action1.confidence).toBe(0.0);

            const action2 = parseAction('    ');
            expect(action2.metadata.isMalformed).toBe(true);
            expect(action2.confidence).toBe(0.0);
        });
    });

    describe('Action Validator', () => {
        it('validates a standard action successfully', () => {
            const action = parseAction('cargo build');
            const res = validateAction(action);
            expect(res.valid).toBe(true);
            expect(res.errors).toHaveLength(0);
        });

        it('warns when validating unknown commands', () => {
            const action = parseAction('unknowncmd 123');
            const res = validateAction(action);
            expect(res.valid).toBe(true); // structurally valid, but contains warning
            expect(res.warnings.length).toBeGreaterThan(0);
        });
    });
});
