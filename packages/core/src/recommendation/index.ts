import { Action, ContextSnapshot, KnowledgeMatch, Recommendation, RiskAssessment } from '@oei/types';
import { RecommendationPolicy } from './policy.js';
import { RecommendationExplainer } from './explainer.js';
import { RecommendationEngineOptions } from './types.js';

export * from './types.js';
export { RemediationBuilder } from './remediation.js';
export { RecommendationPolicy } from './policy.js';
export { RecommendationExplainer } from './explainer.js';

export async function generateRecommendation(
    action: Action,
    context: ContextSnapshot,
    matches: KnowledgeMatch[],
    riskAssessment: Omit<RiskAssessment, 'explanation'>,
    options?: RecommendationEngineOptions
): Promise<Recommendation> {
    const baseRecommendation = RecommendationPolicy.evaluate(action, context, matches, riskAssessment);

    if (options?.includeAiExplainer) {
        const explainer = new RecommendationExplainer(options.aiProvider);
        const explanation = await explainer.explain(action, context, matches, riskAssessment, baseRecommendation);

        return {
            ...baseRecommendation,
            explanation,
        };
    }

    return baseRecommendation;
}
