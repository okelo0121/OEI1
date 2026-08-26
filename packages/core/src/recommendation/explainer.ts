import { Action, ContextSnapshot, KnowledgeMatch, Recommendation, RecommendationExplanation, RiskAssessment } from '@oei/types';
import { AIProvider, MockAIProvider } from '@oei/ai';

export class RecommendationExplainer {
    constructor(private provider: AIProvider = new MockAIProvider()) { }

    /**
     * Generate structured natural-language RecommendationExplanation without altering deterministic decision.
     */
    async explain(
        action: Action,
        context: ContextSnapshot,
        matches: KnowledgeMatch[],
        riskAssessment: Omit<RiskAssessment, 'explanation'>,
        recommendation: Recommendation
    ): Promise<RecommendationExplanation> {
        try {
            const evidenceReferences = (recommendation.evidence || [])
                .map(e => e.sourceUrl)
                .filter((url): url is string => Boolean(url));

            const topImpact = matches.length > 0 && matches[0].fact.impact
                ? matches[0].fact.impact
                : `Action '${action.operation}' evaluated under policy '${recommendation.action}'.`;

            const remediationText = recommendation.remediation.length > 0
                ? recommendation.remediation.map((s, i) => `${i + 1}. [${s.safety}] ${s.description}${s.command ? ` ($ ${s.command})` : ''}`).join('\n')
                : 'No specific remediation actions required.';

            const summary = `Policy action '${recommendation.action}' assigned for command '$ ${action.rawCommand}'.`;

            const uncertainties: string[] = [];
            const hasUnknownVersion = matches.some(m => m.versionMatch === 'unknown');
            if (hasUnknownVersion) {
                uncertainties.push('Runtime version exact match could not be verified against advisory range');
            }

            return {
                summary,
                impact: topImpact,
                remediationExplanation: remediationText,
                uncertainties,
                evidenceReferences,
            };
        } catch {
            return {
                summary: `Recommendation action '${recommendation.action}' active.`,
                impact: 'Review official source guidance.',
                remediationExplanation: 'Follow recommended steps listed above.',
                uncertainties: ['AI explainer fallback active'],
                evidenceReferences: [],
            };
        }
    }
}
