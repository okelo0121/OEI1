import { Action, ContextSnapshot, KnowledgeMatch, Recommendation, RecommendationType, RiskAssessment } from '@oei/types';
import { RemediationBuilder } from './remediation.js';

export class RecommendationPolicy {
    /**
     * Deterministically decide Recommendation (ALLOW, WARN, SUGGESTION, BLOCK) from evidence.
     */
    static evaluate(
        action: Action,
        context: ContextSnapshot,
        matches: KnowledgeMatch[],
        riskAssessment: Omit<RiskAssessment, 'explanation'>
    ): Recommendation {
        const deduplicatedMatches = matches || [];
        const criticalAffectedMatch = deduplicatedMatches.find(
            m => m.fact.severity === 'critical' && (m.versionMatch === 'affected' || m.versionMatch === 'unknown')
        );

        let recAction: RecommendationType = 'ALLOW';
        let title = 'Action Verified Safe to Proceed';
        let urgency: Recommendation['urgency'] = 'low';
        const reasons: string[] = [];

        if (criticalAffectedMatch) {
            recAction = 'BLOCK';
            title = 'Confirmed Critical Security Advisory';
            urgency = 'immediate';
            reasons.push(`Critical advisory: ${criticalAffectedMatch.fact.statement}`);
            if (criticalAffectedMatch.versionMatch === 'affected') {
                reasons.push(`Installed environment matches affected version range (${criticalAffectedMatch.fact.affectedVersions?.raw || 'known range'})`);
            }
        } else if (
            riskAssessment.level === 'HIGH' ||
            deduplicatedMatches.some(m => m.versionMatch === 'affected') ||
            deduplicatedMatches.some(m => m.fact.severity === 'high')
        ) {
            recAction = 'WARN';
            title = 'Detected Version Compatibility or Security Issue';
            urgency = 'high';

            const affected = deduplicatedMatches.filter(m => m.versionMatch === 'affected');
            if (affected.length > 0) {
                reasons.push(`Detected version affected by documented advisory (${affected[0].fact.statement})`);
            } else {
                reasons.push('High risk score calculated from verified knowledge evidence');
            }
        } else if (
            riskAssessment.level === 'MEDIUM' ||
            (context.git?.isGitRepository && context.git.workingTreeClean === false) ||
            deduplicatedMatches.some(m => m.fact.severity === 'medium')
        ) {
            recAction = 'SUGGESTION';
            title = 'Environmental Improvement Opportunity';
            urgency = 'medium';

            if (context.git?.workingTreeClean === false) {
                reasons.push('Uncommitted changes in Git working tree');
            }
            if (deduplicatedMatches.length > 0) {
                reasons.push(`Medium impact knowledge advisories noted (${deduplicatedMatches[0].fact.statement})`);
            }
        } else {
            recAction = 'ALLOW';
            title = 'Action Verified Safe to Proceed';
            urgency = 'low';
            reasons.push('No verified security or compatibility issues identified in knowledge store');
        }

        const summary = `${title}: ${reasons.join('. ')}.`;
        const remediation = RemediationBuilder.build(action, context, deduplicatedMatches, riskAssessment);

        // Gather unique evidence references
        const evidenceMap = new Map<string, { sourceId: string; sourceUrl?: string; authority?: string; confidence: number }>();
        for (const m of deduplicatedMatches) {
            const srcId = m.fact.sourceId;
            if (!evidenceMap.has(srcId)) {
                evidenceMap.set(srcId, {
                    sourceId: srcId,
                    sourceUrl: m.fact.evidence?.sourceUrl,
                    authority: m.authority,
                    confidence: m.fact.confidence,
                });
            }
        }

        // Overall recommendation confidence
        const confidence = deduplicatedMatches.length > 0
            ? Math.min(1.0, Math.max(0.70, Number((deduplicatedMatches.reduce((acc, m) => acc + m.fact.confidence, 0) / deduplicatedMatches.length).toFixed(2))))
            : 0.95;

        return {
            action: recAction,
            title,
            summary,
            reasons,
            remediation,
            evidence: Array.from(evidenceMap.values()),
            confidence,
            urgency,
        };
    }
}
