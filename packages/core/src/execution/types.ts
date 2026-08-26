import {
    ExecutionAudit,
    ExecutionCommand,
    ExecutionDecision,
    ExecutionDecisionType,
    ExecutionResult,
} from '@oei/types';

export type {
    ExecutionAudit,
    ExecutionCommand,
    ExecutionDecision,
    ExecutionDecisionType,
    ExecutionResult,
};

export const OEI_EXIT_CODES = {
    SUCCESS: 0,
    COMMAND_FAILED: 1,
    BLOCKED_BY_POLICY: 2,
    CONFIRMATION_DECLINED: 3,
    GATE_ERROR: 4,
    UNSUPPORTED_SHELL_COMMAND: 5,
} as const;

export interface ExecutionOptions {
    dryRun?: boolean;
    autoConfirm?: boolean;
    cwd?: string;
    auditLogPath?: string;
}
