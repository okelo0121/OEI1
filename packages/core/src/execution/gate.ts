import { ExecutionDecision, Recommendation, RiskAssessment } from '@oei/types';

export class ExecutionGate {
    /**
     * Determine execution gate decision from Recommendation and RiskAssessment.
     */
    static evaluate(
        riskAssessment: Omit<RiskAssessment, 'explanation'>,
        recommendation: Recommendation
    ): ExecutionDecision {
        const timestamp = new Date().toISOString();

        if (recommendation.action === 'BLOCK') {
            return {
                decision: 'BLOCK',
                reason: `Execution blocked by OEI Security Policy: ${recommendation.summary}`,
                riskAssessment,
                recommendation,
                executionAllowed: false,
                timestamp,
            };
        }

        if (recommendation.action === 'WARN') {
            return {
                decision: 'REQUIRE_CONFIRMATION',
                reason: `Execution requires developer review and confirmation: ${recommendation.summary}`,
                riskAssessment,
                recommendation,
                executionAllowed: false,
                timestamp,
            };
        }

        return {
            decision: 'ALLOW',
            reason: `Execution permitted: ${recommendation.summary}`,
            riskAssessment,
            recommendation,
            executionAllowed: true,
            timestamp,
        };
    }
}
