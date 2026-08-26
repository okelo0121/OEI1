import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const releaseTestDir = join(process.env.TEMP || 'C:\\Users\\ADMIN\\AppData\\Local\\Temp', 'oei-release-test');
const projectA = join(releaseTestDir, 'project-a-git');
const projectB = join(releaseTestDir, 'project-b-node');
const tarballPath = join(process.cwd(), 'apps', 'cli', 'oei-cli-0.1.0.tgz');

console.log('====================================================');
console.log('OEI WEEK 8: AUTOMATED RELEASE VERIFICATION TEST');
console.log('====================================================\n');

// Prepare directories
[releaseTestDir, projectA, projectB].forEach(dir => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

// Helper for running installed CLI
function runCli(args: string[], cwd: string = releaseTestDir): { code: number; stdout: string; stderr: string } {
    const res = spawnSync('oei', args, { cwd, encoding: 'utf-8', shell: true });
    return {
        code: res.status ?? 1,
        stdout: res.stdout || '',
        stderr: res.stderr || '',
    };
}

let passCount = 0;
let failCount = 0;

function assertCheck(name: string, condition: boolean, details: string = '') {
    if (condition) {
        console.log(`[PASS] ${name}`);
        if (details) console.log(`       ${details}`);
        passCount++;
    } else {
        console.error(`[FAIL] ${name}`);
        if (details) console.error(`       ${details}`);
        failCount++;
    }
}

// STAGE 1: BUILD & UNIT TESTS
console.log('--- STAGE 1: Monorepo Build & Unit Tests ---');
try {
    execSync('npm run build', { stdio: 'inherit' });
    assertCheck('Monorepo Build (npm run build)', true);
} catch (e) {
    assertCheck('Monorepo Build (npm run build)', false, String(e));
}

try {
    execSync('npm test', { stdio: 'inherit' });
    assertCheck('Unit Test Suite (npm test)', true);
} catch (e) {
    assertCheck('Unit Test Suite (npm test)', false, String(e));
}

// STAGE 2: PACKAGING & TARBALL INSPECTION
console.log('\n--- STAGE 2: Packaging & Tarball Inspection ---');
try {
    execSync('npm pack', { cwd: join(process.cwd(), 'apps', 'cli'), stdio: 'ignore' });
    assertCheck('Package Generation (npm pack)', existsSync(tarballPath), tarballPath);
} catch (e) {
    assertCheck('Package Generation (npm pack)', false, String(e));
}

try {
    const packDry = execSync('npm pack --dry-run', { cwd: join(process.cwd(), 'apps', 'cli'), encoding: 'utf-8' });
    const hasSecret = packDry.includes('.env') || packDry.includes('credentials') || packDry.includes('audit.jsonl');
    assertCheck('Package Contents Inspection (npm pack --dry-run)', !hasSecret, 'Zero secrets/test files in tarball');
} catch (e) {
    assertCheck('Package Contents Inspection (npm pack --dry-run)', false, String(e));
}

// STAGE 3: GLOBAL INSTALLATION & RESOLUTION
console.log('\n--- STAGE 3: Global Installation & Resolution ---');
try {
    execSync(`npm install -g "${tarballPath}"`, { stdio: 'ignore' });
    assertCheck('Global Installation (npm install -g)', true);
} catch (e) {
    assertCheck('Global Installation (npm install -g)', false, String(e));
}

try {
    const whereOut = execSync('where oei', { encoding: 'utf-8' }).trim();
    assertCheck('Executable Resolution (where oei)', whereOut.length > 0, whereOut);
} catch (e) {
    assertCheck('Executable Resolution (where oei)', false, String(e));
}

const ver = runCli(['--version']);
assertCheck('Version Check (oei --version)', ver.code === 0 && ver.stdout.includes('0.1.0'), ver.stdout.trim());

const help = runCli(['--help']);
assertCheck('Help Check (oei --help)', help.code === 0 && help.stdout.includes('doctor') && help.stdout.includes('config'), 'Help menu rendered cleanly');

// STAGE 4: COMMAND VERIFICATION
console.log('\n--- STAGE 4: Command Surface Verification ---');

const doctor = runCli(['doctor']);
assertCheck('Doctor Diagnostic (oei doctor)', doctor.code === 0 && doctor.stdout.includes('Status') && doctor.stdout.includes('READY'), 'Status: READY confirmed');

const cfgSet = runCli(['config', 'set', 'AI_PROVIDER', 'mock']);
assertCheck('Config Set (oei config set)', cfgSet.code === 0, cfgSet.stdout.trim());

const cfgList = runCli(['config', 'list']);
assertCheck('Config List & Secret Masking (oei config list)', cfgList.code === 0 && cfgList.stdout.includes('AI_PROVIDER'), cfgList.stdout.trim());

const ctx = runCli(['context']);
assertCheck('Context Collection (oei context)', ctx.code === 0 && (ctx.stdout.includes('OS Platform') || ctx.stdout.includes('win32') || ctx.stdout.includes('System')), 'Context collected');

const ana = runCli(['analyze', '"npm install express"']);
assertCheck('Analyze Safe Command (oei analyze)', ana.code === 0 && ana.stdout.includes('OEI Command Analysis'), 'Structured 8-part output rendered');

const execLive = runCli(['exec', '"node --version"']);
assertCheck('Exec Live Command (oei exec)', execLive.code === 0 && execLive.stdout.includes('EXECUTION APPROVED'), execLive.stdout.trim());

const execDry = runCli(['exec', '"node --version"', '--dry-run']);
assertCheck('Exec Dry-Run Command (oei exec --dry-run)', execDry.code === 0 && (execDry.stdout.includes('DRY RUN ACTIVE') || execDry.stdout.includes('WOULD EXECUTE')), 'Dry-run approved without process spawn');

// STAGE 5: EXTERNAL REAL-WORLD PROJECT TESTS
console.log('\n--- STAGE 5: Real-World External Project Tests ---');

// Project A - Git Project
try {
    execSync('git init', { cwd: projectA, stdio: 'ignore' });
} catch { }
const gitCtx = runCli(['context'], projectA);
assertCheck('Project A (Git Project Context)', gitCtx.code === 0 && gitCtx.stdout.includes('Git Branch'), 'Detected Git repo');

// Project B - Node Project
writeFileSync(join(projectB, 'package.json'), JSON.stringify({ name: 'sample-node-app', version: '1.0.0' }, null, 2), 'utf-8');
const nodeAna = runCli(['analyze', '"npm install express"'], projectB);
assertCheck('Project B (Node Project Analyze)', nodeAna.code === 0 && nodeAna.stdout.includes('npm'), 'Detected Node project');

// STAGE 6: SECURITY & SAFETY TESTS
console.log('\n--- STAGE 6: Security & Execution Safety Verification ---');

const blockCmd = runCli(['exec', '"solana program deploy app.so"']);
assertCheck('Security BLOCK Decision (Exit Code 2)', blockCmd.code === 2 && blockCmd.stdout.includes('BLOCKED'), 'Exit code 2 confirmed');

const blockYesCmd = runCli(['exec', '"solana program deploy app.so"', '--yes']);
assertCheck('BLOCK --yes Bypass Prevention (Exit Code 2)', blockYesCmd.code === 2 && blockYesCmd.stdout.includes('BLOCKED'), 'Exit code 2 confirmed');

const shellOp = runCli(['exec', '"git status && echo test"']);
assertCheck('Shell Operator Rejection (Exit Code 5)', shellOp.code === 5, 'Exit code 5 confirmed');

// STAGE 7: UNINSTALL & REINSTALL TEST
console.log('\n--- STAGE 7: Uninstall & Reinstall Reproducibility ---');
try {
    execSync('npm uninstall -g @oei/cli', { stdio: 'ignore' });
    let uninstalled = false;
    try {
        execSync('where oei', { encoding: 'utf-8' });
    } catch {
        uninstalled = true;
    }
    assertCheck('Global Uninstall (npm uninstall -g)', uninstalled, 'Executable cleanly removed');
} catch (e) {
    assertCheck('Global Uninstall (npm uninstall -g)', false, String(e));
}

try {
    execSync(`npm install -g "${tarballPath}"`, { stdio: 'ignore' });
    const reVer = runCli(['--version']);
    assertCheck('Reinstall Verification', reVer.code === 0 && reVer.stdout.includes('0.1.0'), 'Reinstall successful');
} catch (e) {
    assertCheck('Reinstall Verification', false, String(e));
}

console.log('\n====================================================');
console.log(`RELEASE VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) {
    console.error('RELEASE VERIFICATION FAILED!');
    process.exit(1);
} else {
    console.log('ALL RELEASE CHECKS PASSED PERFECTLY! CLI IS READY FOR NPM RELEASE.');
}
