export type ActionCategory =
    | 'deployment'
    | 'git'
    | 'package-management'
    | 'build'
    | 'system'
    | 'unknown';

export type ActionIntentType = 'execute' | 'query' | 'unknown';

export interface ActionMetadata {
    flags: string[];
    options: Record<string, string | boolean>;
    positionalArgs: string[];
    isMalformed?: boolean;
    malformedReason?: string;
    parseTimestamp: string;
}

export interface Action {
    id?: string;
    rawCommand: string;
    tool: string;
    operation: string;
    category: ActionCategory;
    target?: string;
    arguments: string[];
    intent: ActionIntentType;
    confidence: number;
    metadata: ActionMetadata;
}

export interface ActionIntent {
    id: string;
    rawCommand: string;
    executable: string;
    args: string[];
    cwd?: string;
    timestamp: string;
    environment?: Record<string, string>;
}

export interface CommandAction {
    intent: ActionIntent;
    tool: string;
    target?: string;
    operationType: 'install' | 'push' | 'deploy' | 'delete' | 'build' | 'exec' | 'unknown';
}

