import { Action, ActionCategory, ActionIntentType, ActionMetadata } from '@oei/types';

export type { Action, ActionCategory, ActionIntentType, ActionMetadata };

export interface CommandToken {
    value: string;
    raw: string;
    isQuoted: boolean;
    quoteChar?: string;
}

export interface NormalizedCommand {
    rawCommand: string;
    executable: string;
    args: string[];
    tokens: CommandToken[];
    flags: string[];
    options: Record<string, string | boolean>;
    positionalArgs: string[];
    isMalformed: boolean;
    malformedReason?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ActionParserOptions {
    strict?: boolean;
    minConfidence?: number;
}
