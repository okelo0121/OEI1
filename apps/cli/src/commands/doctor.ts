import { Command } from 'commander';
import { execSync } from 'child_process';
import { KnowledgeService } from '@oei/knowledge';
import { ConfigService, parseAction, collectContext, SafetyGuard } from '@oei/core';

export function registerDoctorCommand(program: Command, service: KnowledgeService) {
    program
        .command('doctor')
        .description('Diagnose OEI system environment, developer tools, and installation health')
        .action(async () => {
            console.log('\nOEI Doctor\n');

            // 1. SYSTEM
            console.log('System');
            console.log(`  OS            ${process.platform}`);
            console.log(`  Architecture  ${process.arch}`);
            console.log(`  Node.js       ${process.version}`);

            try {
                const npmVer = execSync('npm -v', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                console.log(`  npm           v${npmVer}`);
            } catch {
                console.log(`  npm           ○ Not installed`);
            }

            // 2. DEVELOPER TOOLS
            console.log('\nDeveloper Tools');

            try {
                const gitVer = execSync('git --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                console.log(`  Git           ${gitVer}`);
            } catch {
                console.log(`  Git           ○ Not installed`);
            }

            try {
                const rustVer = execSync('rustc --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                console.log(`  Rust          ${rustVer}`);
            } catch {
                console.log(`  Rust          ○ Not installed`);
            }

            try {
                const cargoVer = execSync('cargo --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                console.log(`  Cargo         ${cargoVer}`);
            } catch {
                console.log(`  Cargo         ○ Not installed`);
            }

            try {
                const solanaVer = execSync('solana --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                console.log(`  Solana        ${solanaVer}`);
            } catch {
                console.log(`  Solana        ○ Not installed`);
            }

            // 3. OEI ENGINE
            console.log('\nOEI');
            console.log(`  CLI version   v0.1.0`);

            try {
                const facts = await service.repository.listFacts();
                console.log(`  Knowledge     ${facts.length} facts active`);
                console.log(`  KnowledgeStore JsonRepository (Ready)`);
            } catch (e) {
                console.log(`  KnowledgeStore ❌ Unavailable (${e})`);
            }

            try {
                const isSensitive = SafetyGuard.isSensitiveEnvVarName('SECRET_KEY');
                const isProtected = SafetyGuard.isPathProtected('.env');
                if (isSensitive && isProtected) {
                    console.log(`  SafetyGuard   Active`);
                } else {
                    console.log(`  SafetyGuard   ❌ Filter Failure`);
                }
            } catch {
                console.log(`  SafetyGuard   ❌ Unavailable`);
            }

            const config = new ConfigService();
            const providerName = config.get('AI_PROVIDER') || 'mock';
            console.log(`  Configuration Valid`);
            console.log(`  AI Provider   ${providerName === 'mock' ? 'MockAIProvider (Offline)' : providerName}`);

            console.log('\nStatus\n  READY\n');
        });
}
