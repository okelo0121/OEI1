#!/usr/bin/env node
import { existsSync } from 'fs';

if (existsSync('.env')) {
    try {
        (process as any).loadEnvFile?.('.env');
    } catch { }
} else if (existsSync('.env.example')) {
    try {
        (process as any).loadEnvFile?.('.env.example');
    } catch { }
}

import { createCLI } from './cli.js';

async function main() {
    try {
        const program = createCLI();
        await program.parseAsync(process.argv);
    } catch (err: any) {
        if (err?.code === 'commander.unknownCommand' || err?.code === 'commander.missingArgument') {
            process.exit(1);
        }
        const msg = err?.message || String(err);
        console.error(`\nOEI Runtime Error: ${msg}`);
        console.error('Run `oei doctor` to inspect installation health and configuration.\n');
        process.exit(4);
    }
}

main();
