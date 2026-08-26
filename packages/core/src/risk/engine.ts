import { Action, ContextSnapshot, KnowledgeMatch, RiskAssessment, RiskFactor, RiskLevel } from '@oei/types';
import { MatchDeduplicator } from './dedup.js';
import { FACTOR_WEIGHTS, RISK_THRESHOLDS } from './types.js';

export class RiskEngine {
    /**
     * Calculate deterministic, explainable RiskAssessment from Action, ContextSnapshot, and KnowledgeMatches.
     * Environmental signals (dirty repo, tool missing, action category) are capped so they never falsely trigger CRITICAL risk.
     */
    static calculate(
        action: Action,
        context: ContextSnapshot,
        rawMatches: KnowledgeMatch[]
    ): Omit<RiskAssessment, 'explanation'> {
        const matches = MatchDeduplicator.deduplicate(rawMatches || []);
        const factors: RiskFactor[] = [];
        let factScore = 0;

        let hasCriticalAffectedAdvisory = false;
        let hasHighAffectedAdvisory = false;

        // 1. Evaluate Knowledge Matches (Severity, Version, Authority, Confidence)
        for (const m of matches) {
            const fact = m.fact;
            const sev = (fact.severity || 'info').toLowerCase();

            let sevContrib = 0;
            if (sev === 'critical') {
                sevContrib = FACTOR_WEIGHTS.SEVERITY_CRITICAL;
                if (m.versionMatch === 'affected' || m.versionMatch === 'unknown') {
                    hasCriticalAffectedAdvisory = true;
                }
            } else if (sev === 'high') {
                sevContrib = FACTOR_WEIGHTS.SEVERITY_HIGH;
                if (m.versionMatch === 'affected') {
                    hasHighAffectedAdvisory = true;
                }
            } else if (sev === 'medium') {
                sevContrib = FACTOR_WEIGHTS.SEVERITY_MEDIUM;
            } else if (sev === 'low') {
                sevContrib = FACTOR_WEIGHTS.SEVERITY_LOW;
            }

            if (sevContrib > 0) {
                factScore += sevContrib;
                factors.push({
                    type: fact.factType === 'breaking_change' ? 'breaking-change' : 'security-advisory',
                    severity: fact.severity,
                    contribution: sevContrib,
                    description: `Advisory statement: ${fact.statement}`,
                    sourceId: fact.sourceId,
                    sourceUrl: fact.evidence.sourceUrl,
                    authority: m.authority,
                    confidence: fact.confidence,
                });
            }

            // Version Match
            if (m.versionMatch === 'affected') {
                const verContrib = FACTOR_WEIGHTS.VERSION_AFFECTED;
                factScore += verContrib;
                factors.push({
                    type: 'affected-version',
                    severity: 'high',
                    contribution: verContrib,
                    description: `Installed environment matches affected version range (${fact.affectedVersions?.raw || 'known range'})`,
                    sourceId: fact.sourceId,
                    sourceUrl: fact.evidence.sourceUrl,
                    authority: m.authority,
                    confidence: fact.confidence,
                });
            }

            // Official Source Authority
            if (m.authority === 'official') {
                const authContrib = FACTOR_WEIGHTS.OFFICIAL_SOURCE;
                factScore += authContrib;
                factors.push({
                    type: 'source-authority',
                    severity: 'info',
                    contribution: authContrib,
                    description: `Evidence grounded in official documentation (${fact.sourceId})`,
                    sourceId: fact.sourceId,
                    sourceUrl: fact.evidence.sourceUrl,
                    authority: 'official',
                    confidence: fact.confidence,
                });
            }

            // High Confidence Evidence
            if (fact.confidence >= 0.90) {
                const confContrib = FACTOR_WEIGHTS.HIGH_CONFIDENCE_EVIDENCE;
                factScore += confContrib;
                factors.push({
                    type: 'evidence-confidence',
                    severity: 'info',
                    contribution: confContrib,
                    description: `High confidence evidence score (${fact.confidence})`,
                    sourceId: fact.sourceId,
                    sourceUrl: fact.evidence.sourceUrl,
                    authority: m.authority,
                    confidence: fact.confidence,
                });
            }
        }

        // Cap knowledge advisory score if no critical/high affected advisory exists
        let boundedFactScore = factScore;
        if (!hasCriticalAffectedAdvisory && !hasHighAffectedAdvisory) {
            boundedFactScore = Math.min(factScore, 40);
        } else if (!hasCriticalAffectedAdvisory) {
            boundedFactScore = Math.min(factScore, 65);
        }

        // 2. Evaluate Environmental Signals (Capped at 25 total)
        let envScore = 0;
        const category = (action.category || '').toLowerCase();
        const operation = (action.operation || '').toLowerCase();

        if (category === 'deployment' || operation.includes('deploy')) {
            const impactContrib = FACTOR_WEIGHTS.ACTION_IMPACT_DEPLOY;
            envScore += impactContrib;
            factors.push({
                type: 'action-impact',
                severity: 'medium',
                contribution: impactContrib,
                description: `State-changing deployment operation (${action.operation})`,
                confidence: 1.0,
            });
        } else if (category === 'package-management' || operation.includes('install')) {
            const impactContrib = FACTOR_WEIGHTS.ACTION_IMPACT_INSTALL;
            envScore += impactContrib;
            factors.push({
                type: 'action-impact',
                severity: 'low',
                contribution: impactContrib,
                description: `Package manager installation operation (${action.operation})`,
                confidence: 1.0,
            });
        }

        if (context.git?.isGitRepository && context.git.workingTreeClean === false) {
            const envContrib = FACTOR_WEIGHTS.ENVIRONMENT_DIRTY_REPO;
            envScore += envContrib;
            factors.push({
                type: 'environment-mismatch',
                severity: 'medium',
                contribution: envContrib,
                description: `Uncommitted local changes present in Git working tree (${context.git.unstagedFiles?.length || 0} files modified)`,
                confidence: 0.95,
            });
        }

        const tool = (action.tool || '').toLowerCase();
        if (tool !== 'unknown') {
            const runtimeInfo = (context.runtime as any)[tool];
            if (runtimeInfo && runtimeInfo.available === false) {
                const toolContrib = FACTOR_WEIGHTS.TOOL_UNAVAILABLE;
                envScore += toolContrib;
                factors.push({
                    type: 'tool-unavailable',
                    severity: 'medium',
                    contribution: toolContrib,
                    description: `Target tool CLI '${action.tool}' is unavailable in current runtime environment`,
                    confidence: 0.90,
                });
            }
        }

        const boundedEnvScore = Math.min(envScore, 25);

        // 3. Final Score Calculation & Normalization
        let totalScore = boundedFactScore + boundedEnvScore;
        if (!hasCriticalAffectedAdvisory && totalScore >= 75) {
            totalScore = 74; // Reserve CRITICAL (>= 75) exclusively for verified critical advisories
        }

        const score = Math.min(100, Math.max(0, Math.round(totalScore)));

        // 4. Level Assignment
        let level: RiskLevel = 'LOW';
        if (score >= RISK_THRESHOLDS.CRITICAL_MIN) {
            level = 'CRITICAL';
        } else if (score >= 50) {
            level = 'HIGH';
        } else if (score >= 25) {
            level = 'MEDIUM';
        }

        // Overall Confidence calculation
        const sumConf = factors.reduce((acc, f) => acc + f.confidence, 0);
        const overallConfidence = factors.length > 0
            ? Number((sumConf / factors.length).toFixed(2))
            : 0.90;

        return {
            id: `risk-assessment-${Date.now()}`,
            score,
            level,
            factors,
            confidence: overallConfidence,
            methodology: 'Deterministic evidence-weighted risk scoring engine',
            timestamp: new Date().toISOString(),
        };
    }
}
