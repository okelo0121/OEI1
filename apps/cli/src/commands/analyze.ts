import { Command } from 'commander';
import { KnowledgeService } from '@oei/knowledge';
import { ExecutionEngine } from '@oei/core';

export function registerAnalyzeCommand(program: Command, service: KnowledgeService) {
    const engine = new ExecutionEngine(service);

    program
        .command('analyze <commandString>')
        .description('Analyze a developer command against OEI Knowledge & Risk Engine (Analysis-Only)')
        .action(async (commandString: string) => {
            console.log(`\n=== OEI Command Analysis (Analysis-Only) ===`);
            
            const result = await engine.evaluate(commandString);
            const { action, context, matches, riskAssessment, recommendation } = result;

            // 1. COMMAND
            console.log(`1. Command: "$ ${commandString}"\n`);

            // 2. ACTION
            if (action) {
                console.log('2. Action (Deterministic Parser):');
                console.log(`   Tool        : ${action.tool}`);
                console.log(`   Operation   : ${action.operation}`);
                console.log(`   Category    : ${action.category}`);
                if (action.target) console.log(`   Target      : ${action.target}`);
                console.log(`   Confidence  : ${action.confidence}\n`);
            }

            // 3. CONTEXT
            if (context) {
                console.log('3. Context (Workspace Reader):');
                console.log(`   OS          : ${context.workspace.operatingSystem} (${context.workspace.architecture})`);
                console.log(`   Project     : ${context.project.projectType}`);
                if (context.git.isGitRepository) {
                    console.log(`   Git Branch  : ${context.git.branch} (${context.git.workingTreeClean ? 'clean tree' : 'dirty working tree'})`);
                } else {
                    console.log(`   Git         : Non-git directory`);
                }
                const runtimeVer = action?.tool && (context.runtime as any)[action.tool];
                console.log(`   Runtime     : ${runtimeVer?.available ? `available (v${runtimeVer.version})` : 'standard / undetected'}\n`);
            }

            // 4. KNOWLEDGE MATCHES
            console.log(`4. Knowledge Matches (${matches?.length || 0} Deterministic Facts):`);
            if (matches && matches.length > 0) {
                matches.forEach((m, i) => {
                    console.log(`   [Match ${i + 1}]`);
                    console.log(`   Statement   : ${m.fact.statement}`);
                    console.log(`   Relevance   : ${m.relevanceScore}`);
                    console.log(`   Version     : ${m.versionMatch}`);
                    console.log(`   Authority   : ${m.authority.toUpperCase()}`);
                    console.log(`   Evidence URL: ${m.fact.evidence.sourceUrl}`);
                    console.log(`   Reasons     : ${m.matchReasons.join(', ')}`);
                });
                console.log('');
            } else {
                console.log('   No specific advisories found in Knowledge Store for this command.\n');
            }

            // 5. RISK ASSESSMENT
            if (riskAssessment) {
                console.log('5. Risk Assessment (Deterministic Risk Engine):');
                console.log(`   Risk Score  : ${riskAssessment.score}/100`);
                console.log(`   Risk Level  : ${riskAssessment.level}`);
                console.log(`   Confidence  : ${riskAssessment.confidence}`);
                console.log(`   Methodology : ${riskAssessment.methodology}`);

                if (riskAssessment.factors.length > 0) {
                    console.log('   Risk Factors:');
                    riskAssessment.factors.forEach(f => {
                        console.log(`     - [+${f.contribution}] [${f.severity.toUpperCase()}] ${f.description}`);
                        if (f.sourceUrl) {
                            console.log(`       Source Evidence: ${f.sourceUrl}`);
                        }
                    });
                }
                console.log('');
            }

            // 6. RECOMMENDATION & ACTIONABLE REMEDIATION
            if (recommendation) {
                console.log('6. Recommendation & Actionable Remediation (Policy Engine):');
                console.log(`   Policy Gate : ${recommendation.action}`);
                console.log(`   Title       : ${recommendation.title}`);
                console.log(`   Summary     : ${recommendation.summary}`);
                console.log(`   Urgency     : ${recommendation.urgency}`);

                if (recommendation.remediation.length > 0) {
                    console.log('   Actionable Remediation Steps:');
                    recommendation.remediation.forEach((step, i) => {
                        console.log(`     ${i + 1}. [${step.safety}] ${step.description}`);
                        if (step.command) {
                            console.log(`        Fix Command: $ ${step.command}`);
                        }
                    });
                }
                console.log('');

                // 7. EVIDENCE (OFFICIAL PROVENANCE)
                console.log('7. Evidence (Source Provenance References):');
                if (recommendation.evidence.length > 0) {
                    recommendation.evidence.forEach(e => {
                        console.log(`   - [${e.authority?.toUpperCase() || 'SOURCE'}] ${e.sourceId} (${e.sourceUrl || 'internal registry'})`);
                    });
                } else {
                    console.log('   - Standard system default rules (no external advisories matched)');
                }
                console.log('');

                // 8. AI EXPLANATION
                if (recommendation.explanation) {
                    console.log('8. AI Explanation [Non-Evidence Reasoning Boundary]:');
                    console.log(`   Provider    : ${recommendation.explanation.provider || 'MockAIProvider'}`);
                    console.log(`   Summary     : ${recommendation.explanation.summary}`);
                    console.log(`   Impact      : ${recommendation.explanation.impact}\n`);
                }
            }

            console.log('[Notice] `oei analyze` is strictly analysis-only and NEVER executes commands.\n');
        });
}
