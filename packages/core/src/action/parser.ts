import { Action, ActionCategory, ActionIntentType, ActionMetadata } from '@oei/types';
import { ActionNormalizer } from './normalizer.js';
import { NormalizedCommand } from './types.js';

export class ActionParser {
    /**
     * Parse a raw CLI command string into a validated, strongly typed Action object.
     */
    static parse(rawCommand: string): Action {
        const normalized = ActionNormalizer.normalize(rawCommand);
        const parseTimestamp = new Date().toISOString();

        const baseMetadata: ActionMetadata = {
            flags: normalized.flags,
            options: normalized.options,
            positionalArgs: normalized.positionalArgs,
            isMalformed: normalized.isMalformed,
            malformedReason: normalized.malformedReason,
            parseTimestamp,
        };

        if (normalized.isMalformed || !normalized.executable) {
            return {
                rawCommand,
                tool: 'unknown',
                operation: 'unknown',
                category: 'unknown',
                arguments: normalized.args,
                intent: 'unknown',
                confidence: 0.0,
                metadata: baseMetadata,
            };
        }

        const executable = normalized.executable.toLowerCase();

        switch (executable) {
            case 'solana':
                return this.parseSolanaCommand(normalized, baseMetadata);
            case 'git':
                return this.parseGitCommand(normalized, baseMetadata);
            case 'npm':
                return this.parseNpmCommand(normalized, baseMetadata);
            case 'cargo':
                return this.parseCargoCommand(normalized, baseMetadata);
            default:
                return {
                    rawCommand,
                    tool: 'unknown',
                    operation: 'unknown',
                    category: 'unknown',
                    arguments: normalized.args,
                    intent: 'unknown',
                    confidence: 0.0,
                    metadata: baseMetadata,
                };
        }
    }

    private static parseSolanaCommand(
        normalized: NormalizedCommand,
        metadata: ActionMetadata
    ): Action {
        const pos = normalized.positionalArgs;
        const sub1 = pos[0] ? pos[0].toLowerCase() : '';
        const sub2 = pos[1] ? pos[1].toLowerCase() : '';

        let operation = 'unknown';
        let category: ActionCategory = 'deployment';
        let target: string | undefined;
        let intent: ActionIntentType = 'execute';
        let confidence = 1.0;

        if (sub1 === 'program') {
            if (sub2 === 'deploy') {
                operation = 'program deploy';
                // target is the path (e.g. target/deploy/app.so), which is pos[2] or positional arg after flags
                target = pos[2];
            } else if (sub2) {
                operation = `program ${sub2}`;
                target = pos[2];
            } else {
                operation = 'program';
            }
        } else if (sub1 === 'balance' || sub1 === 'address' || sub1 === 'config') {
            operation = sub1 === 'config' && sub2 ? `config ${sub2}` : sub1;
            intent = 'query';
            target = pos[1] || pos[2];
        } else if (sub1) {
            operation = sub1;
            target = pos[1];
        } else {
            confidence = 0.5;
        }

        return {
            rawCommand: normalized.rawCommand,
            tool: 'solana',
            operation,
            category,
            target,
            arguments: normalized.args,
            intent,
            confidence,
            metadata,
        };
    }

    private static parseGitCommand(
        normalized: NormalizedCommand,
        metadata: ActionMetadata
    ): Action {
        const pos = normalized.positionalArgs;
        const sub = pos[0] ? pos[0].toLowerCase() : '';

        let operation = 'unknown';
        let category: ActionCategory = 'git';
        let target: string | undefined;
        let intent: ActionIntentType = 'execute';
        let confidence = 1.0;

        if (sub === 'push' || sub === 'pull') {
            operation = sub;
            const remote = pos[1];
            const branch = pos[2];
            if (remote && branch) {
                target = `${remote}/${branch}`;
            } else if (remote) {
                target = remote;
            }
        } else if (sub === 'commit') {
            operation = 'commit';
            target = metadata.options['-m'] as string | undefined || metadata.options['--message'] as string | undefined;
        } else if (sub === 'checkout' || sub === 'switch' || sub === 'branch') {
            operation = sub;
            target = pos[1];
        } else if (sub === 'clone') {
            operation = 'clone';
            target = pos[1];
        } else if (sub === 'status' || sub === 'log' || sub === 'diff') {
            operation = sub;
            intent = 'query';
        } else if (sub) {
            operation = sub;
            target = pos[1];
        } else {
            confidence = 0.5;
        }

        return {
            rawCommand: normalized.rawCommand,
            tool: 'git',
            operation,
            category,
            target,
            arguments: normalized.args,
            intent,
            confidence,
            metadata,
        };
    }

    private static parseNpmCommand(
        normalized: NormalizedCommand,
        metadata: ActionMetadata
    ): Action {
        const pos = normalized.positionalArgs;
        const sub = pos[0] ? pos[0].toLowerCase() : '';

        let operation = 'unknown';
        let category: ActionCategory = 'package-management';
        let target: string | undefined;
        let intent: ActionIntentType = 'execute';
        let confidence = 1.0;

        if (sub === 'install' || sub === 'i' || sub === 'add') {
            operation = 'install';
            target = pos[1];
        } else if (sub === 'audit') {
            operation = 'audit';
            intent = 'execute'; // or query depending on test expectations
        } else if (sub === 'run' || sub === 'test' || sub === 'build' || sub === 'start') {
            operation = sub === 'run' && pos[1] ? `run ${pos[1]}` : sub;
            target = sub === 'run' ? pos[1] : undefined;
        } else if (sub === 'publish') {
            operation = 'publish';
            target = pos[1];
        } else if (sub) {
            operation = sub;
            target = pos[1];
        } else {
            confidence = 0.5;
        }

        return {
            rawCommand: normalized.rawCommand,
            tool: 'npm',
            operation,
            category,
            target,
            arguments: normalized.args,
            intent,
            confidence,
            metadata,
        };
    }

    private static parseCargoCommand(
        normalized: NormalizedCommand,
        metadata: ActionMetadata
    ): Action {
        const pos = normalized.positionalArgs;
        const sub = pos[0] ? pos[0].toLowerCase() : '';

        let operation = 'unknown';
        let category: ActionCategory = 'build';
        let target: string | undefined;
        let intent: ActionIntentType = 'execute';
        let confidence = 1.0;

        if (sub === 'build') {
            operation = 'build';
            category = 'build';
            target = metadata.options['--bin'] as string | undefined || pos[1];
        } else if (sub === 'test' || sub === 'run' || sub === 'check') {
            operation = sub;
            target = metadata.options['--bin'] as string | undefined || pos[1];
        } else if (sub === 'install' || sub === 'publish') {
            operation = sub;
            category = 'package-management';
            target = pos[1];
        } else if (sub) {
            operation = sub;
            target = pos[1];
        } else {
            confidence = 0.5;
        }

        return {
            rawCommand: normalized.rawCommand,
            tool: 'cargo',
            operation,
            category,
            target,
            arguments: normalized.args,
            intent,
            confidence,
            metadata,
        };
    }
}
