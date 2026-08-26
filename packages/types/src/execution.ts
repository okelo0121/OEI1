import { Action } from './action.js';
import { Recommendation, RecommendationType } from './recommendation.js';
import { RiskAssessment, RiskLevel } from './risk.js';

export type ExecutionDecisionType = 'ALLOW' | 'BLOCK' | 'REQUIRE_CONFIRMATION';

export interface ExecutionDecision {
    decision: ExecutionDecisionType;
    reason: string;
    riskAssessment: Omit<RiskAssessment, 'explanation'>;
    recommendation: Recommendation;
    executionAllowed: boolean;
    timestamp: string;
}

export interface ExecutionCommand {
    rawCommand: string;
    executable: string;
    args: string[];
    cwd: string;
    hasShellOperators: boolean;
    unsupportedShellOperator?: string;
}

export interface ExecutionResult {
    decision: ExecutionDecision;
    executed: boolean;
    exitCode: number;
    command: ExecutionCommand;
    durationMs: number;
    timestamp: string;
    dryRun: boolean;
    userConfirmed?: boolean;
}

export interface ExecutionAudit {
    timestamp: string;
    rawCommand: string;
    tool: string;
    operation: string;
    decision: ExecutionDecisionType;
    riskLevel: RiskLevel;
    riskScore: number;
    recommendationType: RecommendationType;
    executed: boolean;
    exitCode: number;
    dryRun: boolean;
    userConfirmed?: boolean;
}
