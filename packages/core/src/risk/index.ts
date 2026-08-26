import { Action, ContextSnapshot, KnowledgeMatch, RiskAssessment } from '@oei/types';
import { RiskEngine } from './engine.js';
import { RiskReasoner } from './reasoner.js';
import { RiskEngineOptions } from './types.js';

export * from './types.js';
export { MatchDeduplicator } from './dedup.js';
export { RiskEngine } from './engine.js';
export { RiskReasoner } from './reasoner.js';

export async function assessRisk(
    action: Action,
    context: ContextSnapshot,
    matches: KnowledgeMatch[],
    options?: RiskEngineOptions
): Promise<RiskAssessment> {
    const baseAssessment = RiskEngine.calculate(action, context, matches);

    if (options?.includeAiReasoner) {
        const reasoner = new RiskReasoner(options.aiProvider);
        const explanation = await reasoner.explain({
            action,
            context,
            riskAssessment: baseAssessment,
            knowledgeMatches: matches,
        });

        return {
            ...baseAssessment,
            explanation,
        };
    }

    return baseAssessment;
}
