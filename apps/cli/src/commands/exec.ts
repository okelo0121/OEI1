import { Command } from 'commander';
import * as readline from 'readline';
import { KnowledgeService } from '@oei/knowledge';
import { ExecutionEngine, OEI_EXIT_CODES, SafeCommandRunner } from '@oei/core';

async function promptUserConfirmation(message: string): Promise<boolean> {
    if (!process.stdin.isTTY) {
        return false; // Non-interactive environments default to false (N)
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            rl.close();
            const normalized = answer.trim().toLowerCase();
            resolve(normalized === 'y' || normalized === 'yes');
        });
    });
}

export function registerExecCommand(program: Command, service: KnowledgeService) {
    const engine = new ExecutionEngine(service);

    program
        .command('exec <commandString>')
        .description('Analyze and conditionally execute a developer command through OEI Execution Gate')
        .option('--dry-run', 'Perform full gate analysis without executing process', false)
        .option('-y, --yes', 'Automatically confirm WARN recommendations (CI mode)', false)
        .action(async (commandString: string, options: { dryRun?: boolean; yes?: boolean }) => {
            console.log(`\n=== OEI Execution Gate ===`);
            console.log(`Command: "$ ${commandString}"\n`);

            const { evaluation, executionResult } = await engine.execute(commandString, {
                dryRun: options.dryRun,
                autoConfirm: options.yes,
            });

            const { riskAssessment, recommendation } = evaluation;
            const { decision, command } = executionResult;

            // 1. Unsupported Shell Operators Check
            if (command.hasShellOperators) {
                console.error(`\n[OEI EXECUTION BLOCKED]`);
                console.error(`Reason: Shell operator '${command.unsupportedShellOperator}' is not supported by OEI safe execution model.`);
                console.error(`Exit Code: ${OEI_EXIT_CODES.UNSUPPORTED_SHELL_COMMAND}\n`);
                process.exitCode = OEI_EXIT_CODES.UNSUPPORTED_SHELL_COMMAND;
                process.exit(OEI_EXIT_CODES.UNSUPPORTED_SHELL_COMMAND);
            }

            // 2. Dry Run Mode Handling
            if (options.dryRun) {
                console.log(`Decision:  ${decision.decision}`);
                console.log(`Risk:      ${riskAssessment?.level} (${riskAssessment?.score}/100)`);
                console.log(`Result:    [DRY RUN ACTIVE] WOULD ${decision.decision === 'BLOCK' ? 'BLOCK' : 'EXECUTE'}`);
                console.log(`No command was executed.\n`);
                process.exitCode = executionResult.exitCode;
                process.exit(executionResult.exitCode);
            }

            // 3. BLOCK Gate Decision
            if (decision.decision === 'BLOCK') {
                console.log(`==================================================`);
                console.log(`OEI EXECUTION BLOCKED\n`);
                console.log(`Command:     $ ${commandString}`);
                console.log(`Risk:        ${riskAssessment?.level} (${riskAssessment?.score}/100)`);
                console.log(`Reason:      ${recommendation?.summary}\n`);

                if (recommendation?.remediation && recommendation.remediation.length > 0) {
                    console.log(`Recommended Remediation:`);
                    recommendation.remediation.forEach((step, i) => {
                        console.log(`  ${i + 1}. [${step.safety}] ${step.description}`);
                    });
                }
                console.log(`\nThe command was NOT executed.`);
                console.log(`==================================================\n`);
                process.exitCode = OEI_EXIT_CODES.BLOCKED_BY_POLICY;
                process.exit(OEI_EXIT_CODES.BLOCKED_BY_POLICY);
            }

            // 4. REQUIRE_CONFIRMATION Gate Decision (WARN)
            if (decision.decision === 'REQUIRE_CONFIRMATION' && !options.yes) {
                console.log(`==================================================`);
                console.log(`OEI EXECUTION REVIEW\n`);
                console.log(`Command:        $ ${commandString}`);
                console.log(`Risk:           ${riskAssessment?.level} (${riskAssessment?.score}/100)`);
                console.log(`Recommendation: ${recommendation?.action}`);
                console.log(`Reason:         ${recommendation?.summary}\n`);

                const confirmed = await promptUserConfirmation(`Continue and execute this command? [y/N]: `);

                if (!confirmed) {
                    console.log(`\nExecution declined by developer. Command was NOT executed.`);
                    console.log(`Exit Code: ${OEI_EXIT_CODES.CONFIRMATION_DECLINED}\n`);
                    process.exitCode = OEI_EXIT_CODES.CONFIRMATION_DECLINED;
                    process.exit(OEI_EXIT_CODES.CONFIRMATION_DECLINED);
                }

                console.log(`\nOEI: EXECUTION APPROVED BY DEVELOPER ($ ${commandString})\n`);
                const exitCode = await SafeCommandRunner.execute(command);
                process.exitCode = exitCode;
                process.exit(exitCode);
            }

            // 5. Execution Completed (ALLOW or Auto-Confirmed WARN)
            process.exitCode = executionResult.exitCode;
            process.exit(executionResult.exitCode);
        });
}

