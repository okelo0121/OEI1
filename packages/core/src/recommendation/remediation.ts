import { Action, ContextSnapshot, KnowledgeMatch, RemediationStep, RiskAssessment } from '@oei/types';

export class RemediationBuilder {
    /**
     * Build structured actionable remediation steps based on observed risk factors and evidence.
     */
    static build(
        action: Action,
        context: ContextSnapshot,
        matches: KnowledgeMatch[],
        riskAssessment: Omit<RiskAssessment, 'explanation'>
    ): RemediationStep[] {
        const steps: RemediationStep[] = [];
        const tool = (action.tool || '').toLowerCase();

        // 1. Version Range / Security Advisory Remediation
        const affectedMatches = (matches || []).filter(m => m.versionMatch === 'affected');
        if (affectedMatches.length > 0) {
            const urls = affectedMatches
                .map(m => m.fact.evidence?.sourceUrl)
                .filter((url): url is string => Boolean(url));

            steps.push({
                description: `Review official release notes and upgrade guidance for ${action.tool}`,
                command: tool === 'npm' ? 'npm audit' : `${action.tool} --version`,
                safety: 'SAFE',
                evidenceReferences: urls,
            });

            if (tool === 'solana') {
                steps.push({
                    description: 'Upgrade Solana CLI to a supported release version',
                    command: 'solana-install init 2.0.0',
                    safety: 'POTENTIALLY_STATE_CHANGING',
                    evidenceReferences: urls,
                });
            } else if (tool === 'npm') {
                steps.push({
                    description: 'Update affected npm dependencies to patched version',
                    command: `npm update ${action.target || ''}`.trim(),
                    safety: 'POTENTIALLY_STATE_CHANGING',
                    evidenceReferences: urls,
                });
            } else if (tool === 'cargo') {
                steps.push({
                    description: 'Update cargo dependencies in Cargo.toml',
                    command: 'cargo update',
                    safety: 'POTENTIALLY_STATE_CHANGING',
                    evidenceReferences: urls,
                });
            }
        }

        // 2. Git Working Tree Remediation
        if (context.git?.isGitRepository && context.git.workingTreeClean === false) {
            steps.push({
                description: 'Inspect uncommitted modifications in your Git working tree',
                command: 'git status',
                safety: 'SAFE',
            });
            steps.push({
                description: 'Commit or stash pending modifications before performing state-changing action',
                command: 'git stash',
                safety: 'POTENTIALLY_STATE_CHANGING',
            });
        }

        // 3. Tool Availability Remediation
        if (tool !== 'unknown') {
            const runtimeInfo = (context.runtime as any)[tool];
            if (runtimeInfo && runtimeInfo.available === false) {
                steps.push({
                    description: `Verify that target CLI '${action.tool}' is installed and accessible on PATH`,
                    command: `${action.tool} --version`,
                    safety: 'SAFE',
                });
            }
        }

        // 4. Default Verification Step
        steps.push({
            description: 'Re-run OEI analysis to verify resolution of identified risk factors',
            command: `oei analyze "${action.rawCommand}"`,
            safety: 'SAFE',
        });

        return steps;
    }
}
