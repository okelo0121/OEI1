import {
    Action,
    ContextSnapshot,
    ExecutionAudit,
    ExecutionCommand,
    ExecutionDecision,
    ExecutionResult,
    KnowledgeMatch,
    Recommendation,
    RiskAssessment,
} from '@oei/types';
import { SafeCommandParser } from './parser.js';
import { ExecutionGate } from './gate.js';
import { SafeCommandRunner } from './runner.js';
import { AuditLogger } from './audit.js';
import { ExecutionOptions, OEI_EXIT_CODES } from './types.js';

export * from './types.js';
export { SafeCommandParser } from './parser.js';
export { ExecutionGate } from './gate.js';
export { SafeCommandRunner } from './runner.js';
export { AuditLogger } from './audit.js';

export class ExecutionGateRunner {
    /**
     * Parse, evaluate gate decision, and conditionally execute requested developer command.
     */
    static async process(
        rawCommand: string,
        action: Action,
        riskAssessment: Omit<RiskAssessment, 'explanation'>,
        recommendation: Recommendation,
        options?: ExecutionOptions
    ): Promise<ExecutionResult> {
        const startTime = Date.now();
        const parsedCmd = SafeCommandParser.parse(rawCommand, options?.cwd);

        // Check for unsupported shell operators first
        if (parsedCmd.hasShellOperators) {
            const decision: ExecutionDecision = {
                decision: 'BLOCK',
                reason: `Unsupported shell operator '${parsedCmd.unsupportedShellOperator}' detected in command string.`,
                riskAssessment,
                recommendation,
                executionAllowed: false,
                timestamp: new Date().toISOString(),
            };

            const audit: ExecutionAudit = {
                timestamp: new Date().toISOString(),
                rawCommand,
                tool: action.tool,
                operation: action.operation,
                decision: 'BLOCK',
                riskLevel: riskAssessment.level,
                riskScore: riskAssessment.score,
                recommendationType: recommendation.action,
                executed: false,
                exitCode: OEI_EXIT_CODES.UNSUPPORTED_SHELL_COMMAND,
                dryRun: Boolean(options?.dryRun),
            };
            AuditLogger.log(audit, options?.auditLogPath);

            return {
                decision,
                executed: false,
                exitCode: OEI_EXIT_CODES.UNSUPPORTED_SHELL_COMMAND,
                command: parsedCmd,
                durationMs: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                dryRun: Boolean(options?.dryRun),
            };
        }

        const gateDecision = ExecutionGate.evaluate(riskAssessment, recommendation);

        // Handle Dry Run mode
        if (options?.dryRun) {
            const audit: ExecutionAudit = {
                timestamp: new Date().toISOString(),
                rawCommand,
                tool: action.tool,
                operation: action.operation,
                decision: gateDecision.decision,
                riskLevel: riskAssessment.level,
                riskScore: riskAssessment.score,
                recommendationType: recommendation.action,
                executed: false,
                exitCode: gateDecision.decision === 'BLOCK' ? OEI_EXIT_CODES.BLOCKED_BY_POLICY : OEI_EXIT_CODES.SUCCESS,
                dryRun: true,
            };
            AuditLogger.log(audit, options?.auditLogPath);

            return {
                decision: gateDecision,
                executed: false,
                exitCode: gateDecision.decision === 'BLOCK' ? OEI_EXIT_CODES.BLOCKED_BY_POLICY : OEI_EXIT_CODES.SUCCESS,
                command: parsedCmd,
                durationMs: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                dryRun: true,
            };
        }

        // Handle BLOCK decision
        if (gateDecision.decision === 'BLOCK') {
            const audit: ExecutionAudit = {
                timestamp: new Date().toISOString(),
                rawCommand,
                tool: action.tool,
                operation: action.operation,
                decision: 'BLOCK',
                riskLevel: riskAssessment.level,
                riskScore: riskAssessment.score,
                recommendationType: recommendation.action,
                executed: false,
                exitCode: OEI_EXIT_CODES.BLOCKED_BY_POLICY,
                dryRun: false,
            };
            AuditLogger.log(audit, options?.auditLogPath);

            return {
                decision: gateDecision,
                executed: false,
                exitCode: OEI_EXIT_CODES.BLOCKED_BY_POLICY,
                command: parsedCmd,
                durationMs: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                dryRun: false,
            };
        }

        // Handle ALLOW / autoConfirm execution
        if (gateDecision.executionAllowed || options?.autoConfirm) {
            console.log(`\nOEI: EXECUTION APPROVED ($ ${parsedCmd.rawCommand})\n`);
            const exitCode = await SafeCommandRunner.execute(parsedCmd);

            const audit: ExecutionAudit = {
                timestamp: new Date().toISOString(),
                rawCommand,
                tool: action.tool,
                operation: action.operation,
                decision: gateDecision.decision,
                riskLevel: riskAssessment.level,
                riskScore: riskAssessment.score,
                recommendationType: recommendation.action,
                executed: true,
                exitCode,
                dryRun: false,
                userConfirmed: options?.autoConfirm,
            };
            AuditLogger.log(audit, options?.auditLogPath);

            return {
                decision: gateDecision,
                executed: true,
                exitCode,
                command: parsedCmd,
                durationMs: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                dryRun: false,
                userConfirmed: options?.autoConfirm,
            };
        }

        // Handle REQUIRE_CONFIRMATION when non-interactive or unconfirmed
        return {
            decision: gateDecision,
            executed: false,
            exitCode: OEI_EXIT_CODES.CONFIRMATION_DECLINED,
            command: parsedCmd,
            durationMs: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            dryRun: false,
        };
    }
}
