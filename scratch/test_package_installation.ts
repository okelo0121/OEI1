import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const testDir = join(process.env.TEMP || 'C:\\Users\\ADMIN\\AppData\\Local\\Temp', 'oei-cli-package-test');
const sampleProject = join(testDir, 'sample-project');
const tarballPath = join(process.cwd(), 'apps', 'cli', 'oei-cli-0.1.0.tgz');

console.log('=== OEI PACKAGED CLI VERIFICATION ===\n');

if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
if (!existsSync(sampleProject)) mkdirSync(sampleProject, { recursive: true });

console.log('0. Installing local tarball globally...');
execSync(`npm install -g "${tarballPath}"`, { stdio: 'ignore' });

function runCli(args: string[], cwd: string = testDir): { code: number; stdout: string; stderr: string } {
    const res = spawnSync('oei', args, { cwd, encoding: 'utf-8', shell: true });
    return {
        code: res.status ?? 1,
        stdout: res.stdout || '',
        stderr: res.stderr || '',
    };
}

// 1. Resolution & Version
console.log('1. Executable Resolution (where oei):');
try {
    const whereOut = execSync('where oei', { encoding: 'utf-8' });
    console.log(`   Path: ${whereOut.trim()}`);
} catch (e) {
    console.error('   Failed where oei:', e);
}

const verRes = runCli(['--version']);
console.log(`2. Version Test (oei --version): Code=${verRes.code}, Output=${verRes.stdout.trim()}`);

const helpRes = runCli(['--help']);
console.log(`3. Help Test (oei --help): Code=${helpRes.code}, Includes analyze/exec=${helpRes.stdout.includes('analyze') && helpRes.stdout.includes('exec')}`);

// 4. Context Test
const ctxRes = runCli(['context']);
console.log(`4. Context Test (oei context): Code=${ctxRes.code}, Has OS info=${ctxRes.stdout.includes('OS Platform') || ctxRes.stdout.includes('win32')}`);

// 5. Analyze Test
const ana1 = runCli(['analyze', '"git status"']);
console.log(`5. Analyze Safe Command: Code=${ana1.code}, Recommendation=${ana1.stdout.includes('ALLOW') || ana1.stdout.includes('SUGGESTION')}`);

const ana2 = runCli(['analyze', '"npm install express"']);
console.log(`6. Analyze NPM Install: Code=${ana2.code}, Contains risk score=${ana2.stdout.includes('Risk Score') || ana2.stdout.includes('LOW') || ana2.stdout.includes('MEDIUM')}`);

// 7. Exec Live & Dry-Run
const execLive = runCli(['exec', '"node --version"']);
console.log(`7. Exec Live (node --version): Code=${execLive.code}, Output=${execLive.stdout.trim()}`);

const execDry = runCli(['exec', '"node --version"', '--dry-run']);
console.log(`8. Exec Dry-Run: Code=${execDry.code}, Output includes DRY-RUN=${execDry.stdout.includes('DRY-RUN ACTIVE') || execDry.stdout.includes('WOULD EXECUTE')}`);

// 9. Knowledge Engine Test
const kSources = runCli(['knowledge', 'sources']);
console.log(`9. Knowledge Sources: Code=${kSources.code}, Contains sources=${kSources.stdout.includes('solana-cli-docs')}`);

const kSearch = runCli(['knowledge', 'search', '"Solana"']);
console.log(`10. Knowledge Search: Code=${kSearch.code}, Found facts=${kSearch.stdout.includes('Solana') || kSearch.stdout.includes('fact_')}`);

// 11. External Workspace Test
console.log('\n--- External Workspace Tests ---');
try {
    execSync('git init', { cwd: sampleProject, stdio: 'ignore' });
} catch { }

const extCtx = runCli(['context'], sampleProject);
console.log(`11. External Workspace Context: Code=${extCtx.code}, Is Git Repo=${extCtx.stdout.includes('Git Repo: yes')}`);

const extAna = runCli(['analyze', '"git status"'], sampleProject);
console.log(`12. External Workspace Analyze: Code=${extAna.code}`);

// 12. Controlled BLOCK & --yes Bypass Prevention Test
console.log('\n--- Security BLOCK & Bypass Tests ---');
const blockRes = runCli(['exec', '"solana program deploy app.so"'], sampleProject);
console.log(`13. BLOCK Test: Code=${blockRes.code} (Expected 2), Output contains BLOCKED=${blockRes.stdout.includes('BLOCKED')}`);

const blockYesRes = runCli(['exec', '"solana program deploy app.so"', '--yes'], sampleProject);
console.log(`14. BLOCK --yes Bypass Test: Code=${blockYesRes.code} (Expected 2), Output contains BLOCKED=${blockYesRes.stdout.includes('BLOCKED')}`);

// 13. Shell Safety Test
console.log('\n--- Shell Safety Tests ---');
const shellAnd = runCli(['exec', '"git status && echo test"'], sampleProject);
console.log(`15. Shell Operator &&: Code=${shellAnd.code} (Expected 5)`);

const shellSemi = runCli(['exec', '"git status; echo test"'], sampleProject);
console.log(`16. Shell Operator ;: Code=${shellSemi.code} (Expected 5)`);

const shellPipe = runCli(['exec', '"git status | echo test"'], sampleProject);
console.log(`17. Shell Operator |: Code=${shellPipe.code} (Expected 5)`);

const shellRedir = runCli(['exec', '"git status > out.txt"'], sampleProject);
console.log(`18. Shell Operator >: Code=${shellRedir.code} (Expected 5)`);

const shellSub = runCli(['exec', '"echo $(whoami)"'], sampleProject);
console.log(`19. Shell Operator $(): Code=${shellSub.code} (Expected 5)`);

// 14 & 15. Uninstall & Reinstall Test
console.log('\n--- Uninstall & Reinstall Test ---');
try {
    execSync('npm uninstall -g @oei/cli', { stdio: 'ignore' });
    console.log('20. Uninstall: Executed successfully.');
} catch (e) {
    console.error('Uninstall failed:', e);
}

let uninstalledResolved = false;
try {
    const unWhere = execSync('where oei', { encoding: 'utf-8' });
    console.log(`   Unexpectedly still resolved: ${unWhere.trim()}`);
    uninstalledResolved = true;
} catch {
    console.log('21. Uninstall Resolution Check: oei executable cleanly removed!');
}

console.log('22. Reinstalling tarball...');
try {
    execSync(`npm install -g "${tarballPath}"`, { stdio: 'ignore' });
    const reVer = runCli(['--version']);
    console.log(`23. Reinstall Version Check: Code=${reVer.code}, Output=${reVer.stdout.trim()}`);
} catch (e) {
    console.error('Reinstall failed:', e);
}

console.log('\n=== ALL PACKAGED CLI TESTS COMPLETE ===');
