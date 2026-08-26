import { RiskExplanation, RiskReasoningInput } from '@oei/types';
import { AIProvider, MockAIProvider } from '@oei/ai';

export class RiskReasoner {
    constructor(private provider: AIProvider = new MockAIProvider()) { }

    /**
     * Generate structured RiskExplanation without modifying deterministic risk scores or evidence provenance.
     */
    async explain(input: RiskReasoningInput): Promise<RiskExplanation> {
        try {
            const { action, riskAssessment, knowledgeMatches } = input;

            const evidenceReferences = knowledgeMatches
                .map(m => m.fact.evidence?.sourceUrl)
                .filter((url): url is string => Boolean(url));

            const topImpact = knowledgeMatches.length > 0 && knowledgeMatches[0].fact.impact
                ? knowledgeMatches[0].fact.impact
                : `Operation '${action.operation}' modifies execution context or system state.`;

            const factorSummaries = riskAssessment.factors
                .map(f => `[+${f.contribution}] ${f.description}`)
                .join('; ');

            const summary = `Operation '$ ${action.rawCommand}' evaluated as ${riskAssessment.level} risk (score ${riskAssessment.score}/100).`;
            const reasoning = riskAssessment.factors.length > 0
                ? `Risk score of ${riskAssessment.score} derived from factors: ${factorSummaries}.`
                : 'Baseline risk level assigned due to absence of specific security advisories.';

            const uncertainties: string[] = [];
            const hasUnknownVersion = knowledgeMatches.some(m => m.versionMatch === 'unknown');
            if (hasUnknownVersion) {
                uncertainties.push('Runtime version exact match could not be verified against advisory range');
            }

            return {
                summary,
                impact: topImpact,
                reasoning,
                evidenceReferences,
                uncertainties,
            };
        } catch {
            return {
                summary: `Evaluated as ${input.riskAssessment.level} risk (score ${input.riskAssessment.score}/100).`,
                impact: 'Execution impact requires manual review.',
                reasoning: input.riskAssessment.methodology,
                evidenceReferences: [],
                uncertainties: ['AI reasoner provider fallback active'],
            };
        }
    }
}
