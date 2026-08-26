import { Command } from 'commander';
import { ExecutionEngine, parseAction, collectContext } from '@oei/core';

export function registerContextCommand(program: Command) {
    program
        .command('context [commandString]')
        .description('Inspect current workspace context snapshot safely')
        .action((commandString?: string) => {
            const rawCmd = commandString || 'git status';
            const action = parseAction(rawCmd);
            const context = collectContext(action);

            console.log('\n=== OEI Context Snapshot ===');
            console.log('Action:');
            console.log(`  Raw Command : ${action.rawCommand}`);
            console.log(`  Tool        : ${action.tool}`);
            console.log(`  Operation   : ${action.operation}`);
            console.log(`  Category    : ${action.category}`);

            console.log('\nContext:');
            console.log(`  OS          : ${context.workspace.operatingSystem} (${context.workspace.architecture})`);
            console.log(`  Project Root: ${context.workspace.projectRoot}`);
            console.log(`  Project Type: ${context.project.projectType}`);
            console.log(`  Pkg Manager : ${context.project.packageManager || 'unknown'}`);
            console.log(`  Git Repo    : ${context.git.isGitRepository ? 'yes' : 'no'}`);
            if (context.git.isGitRepository) {
                console.log(`  Git Branch  : ${context.git.branch}`);
                console.log(`  Git Status  : ${context.git.workingTreeClean ? 'clean' : 'dirty'}`);
                console.log(`  Staged Files: ${context.git.stagedFiles?.length || 0}`);
                console.log(`  Unstaged    : ${context.git.unstagedFiles?.length || 0}`);
            }
            console.log(`  Node        : ${context.runtime.node?.available ? `available (${context.runtime.node.version})` : 'unavailable'}`);
            console.log(`  npm         : ${context.runtime.npm?.available ? `available (${context.runtime.npm.version})` : 'unavailable'}`);
            console.log(`  Rust        : ${context.runtime.rust?.available ? `available (${context.runtime.rust.version})` : 'unavailable'}`);
            console.log(`  Cargo       : ${context.runtime.cargo?.available ? `available (${context.runtime.cargo.version})` : 'unavailable'}`);
            console.log(`  Solana CLI  : ${context.runtime.solana?.available ? `available (${context.runtime.solana.version})` : 'unavailable'}`);

            console.log('\nSensitive Values:');
            console.log('  [NOT COLLECTED - Protected by SafetyGuard]\n');
        });
}
