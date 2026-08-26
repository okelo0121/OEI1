import { Command } from 'commander';
import { KnowledgeService } from '@oei/knowledge';
import { registerKnowledgeCommands } from './commands/knowledge.js';
import { registerAnalyzeCommand } from './commands/analyze.js';
import { registerContextCommand } from './commands/context.js';
import { registerExecCommand } from './commands/exec.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerConfigCommands } from './commands/config.js';

export function createCLI(): Command {
    const program = new Command();
    const service = new KnowledgeService();

    program
        .name('oei')
        .description('OEI (Open Execution Intelligence) CLI - Execution-aware safety & risk intelligence protocol')
        .version('0.1.0');

    program.configureOutput({
        writeErr: (str) => {
            const trimmed = str.trim();
            if (trimmed.startsWith("error: unknown command '")) {
                const cmdName = trimmed.replace("error: unknown command '", '').replace("'.", '').replace("'", '');
                console.error(`\nOEI Error\n\nUnknown command: ${cmdName}\n\nRun:\n  oei --help\n`);
            } else if (trimmed.includes("missing required argument 'commandString'")) {
                if (process.argv.includes('analyze')) {
                    console.error(`\nOEI Error\n\nCommand:\n  oei analyze\n\nProblem:\n  Missing command to analyze.\n\nUsage:\n  oei analyze "<command>"\n`);
                } else if (process.argv.includes('exec')) {
                    console.error(`\nOEI Error\n\nCommand:\n  oei exec\n\nProblem:\n  Missing command to execute.\n\nUsage:\n  oei exec "<command>"\n`);
                } else {
                    console.error(`\nOEI Error\n\n${trimmed}\n\nRun:\n  oei --help\n`);
                }
            } else {
                console.error(`\nOEI Error\n\n${trimmed}\n`);
            }
        },
    });

    registerKnowledgeCommands(program, service);
    registerAnalyzeCommand(program, service);
    registerContextCommand(program);
    registerExecCommand(program, service);
    registerDoctorCommand(program, service);
    registerConfigCommands(program);

    return program;
}
