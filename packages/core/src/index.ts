import { AnalysisReport, ContextSnapshot, ExecutionResult, KnowledgeMatch, Recommendation, RiskAssessment } from '@oei/types';
import { KnowledgeService } from '@oei/knowledge';
import { parseAction, Action, validateAction } from './action/index.js';
import { collectContext } from './context/index.js';
import { assessRisk } from './risk/index.js';
import { generateRecommendation } from './recommendation/index.js';
import { ExecutionGateRunner, ExecutionOptions } from './execution/index.js';

export * from './action/index.js';
export * from './context/index.js';
export * from './risk/index.js';
export * from './recommendation/index.js';
export * from './execution/index.js';
export * from './config/index.js';

export class ExecutionEngine {
    constructor(private knowledgeService: KnowledgeService = new KnowledgeService()) { }

    parse(command: string): Action {
        return parseAction(command);
    }

    collectContext(action?: Action): ContextSnapshot {
        return collectContext(action);
    }

    async evaluate(command: string): Promise<{
        status: string;
        message: string;
        action?: Action;
        context?: ContextSnapshot;
        matches?: KnowledgeMatch[];
        riskAssessment?: RiskAssessment;
        recommendation?: Recommendation;
        report?: AnalysisReport;
    }> {
        const action = parseAction(command);
        const validation = validateAction(action);
        const context = collectContext(action);

        // Deterministic Action + Context Knowledge Fact Matching
        const matches = await this.knowledgeService.matchActionContext(action, context);

        // Deterministic Risk Assessment Calculation
        const riskAssessment = await assessRisk(action, context, matches, { includeAiReasoner: true });

        // Deterministic Recommendation Policy Engine
        const recommendation = await generateRecommendation(action, context, matches, riskAssessment, { includeAiExplainer: true });

        return {
            status: validation.valid ? 'PARSED' : 'UNKNOWN_ACTION',
            message: `Evaluated ${action.tool} '${action.operation}' at ${riskAssessment.level} risk level (Score ${riskAssessment.score}/100) -> Recommendation: ${recommendation.action}.`,
            action,
            context,
            matches,
            riskAssessment,
            recommendation,
        };
    }

    async execute(commandString: string, options?: ExecutionOptions): Promise<{
        evaluation: Awaited<ReturnType<ExecutionEngine['evaluate']>>;
        executionResult: ExecutionResult;
    }> {
        const evaluation = await this.evaluate(commandString);
        const { action, riskAssessment, recommendation } = evaluation;

        const executionResult = await ExecutionGateRunner.process(
            commandString,
            action!,
            riskAssessment!,
            recommendation!,
            options
        );

        return {
            evaluation,
            executionResult,
        };
    }
}






