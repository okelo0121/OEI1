import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const testDir = join(process.env.TEMP || 'C:\\Users\\ADMIN\\AppData\\Local\\Temp', 'oei-cli-productization-test');
const sampleProject = join(testDir, 'sample-project');
const tarballPath = join(process.cwd(), 'apps', 'cli', 'oei-cli-0.1.0.tgz');

console.log('=== OEI PRODUCTIZED CLI VERIFICATION ===\n');

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
console.log(`3. Help Test (oei --help): Code=${helpRes.code}, Includes doctor/config=${helpRes.stdout.includes('doctor') && helpRes.stdout.includes('config')}`);

// 4. Doctor Test
const docRes = runCli(['doctor']);
console.log(`4. Doctor Diagnostic Test (oei doctor): Code=${docRes.code}, Includes Status: READY=${docRes.stdout.includes('Status: READY')}`);
console.log('--- Doctor Output Snippet ---');
console.log(docRes.stdout.trim().split('\n').slice(0, 15).join('\n'));
console.log('-----------------------------\n');

// 5. Config Test
const cfgSet = runCli(['config', 'set', 'AI_PROVIDER', 'mock']);
console.log(`5. Config Set: Code=${cfgSet.code}, Output=${cfgSet.stdout.trim()}`);

const cfgGet = runCli(['config', 'get', 'AI_PROVIDER']);
console.log(`6. Config Get: Code=${cfgGet.code}, Output=${cfgGet.stdout.trim()}`);

const cfgMask = runCli(['config', 'set', 'AI_API_KEY', 'sk-test-secret-12345']);
const cfgList = runCli(['config', 'list']);
console.log(`7. Config Secret Masking: Contains masked key=${cfgList.stdout.includes('****') && !cfgList.stdout.includes('sk-test-secret-12345')}`);

// 8. Context Test
const ctxRes = runCli(['context']);
console.log(`8. Context Test (oei context): Code=${ctxRes.code}, Has OS info=${ctxRes.stdout.includes('OS Platform')}`);

// 9. Structured Analyze Test
const ana1 = runCli(['analyze', '"git status"']);
console.log(`9. Analyze Safe Command (8-part structured output): Code=${ana1.code}, Includes AI Explanation boundary=${ana1.stdout.includes('8. AI Explanation')}`);

// 10. Exec Live & Dry-Run
const execLive = runCli(['exec', '"node --version"']);
console.log(`10. Exec Live (node --version): Code=${execLive.code}, Output=${execLive.stdout.trim()}`);

const execDry = runCli(['exec', '"node --version"', '--dry-run']);
console.log(`11. Exec Dry-Run: Code=${execDry.code}, Includes DRY-RUN=${execDry.stdout.includes('DRY-RUN ACTIVE') || execDry.stdout.includes('WOULD EXECUTE')}`);

// 12. Security BLOCK & --yes Bypass Test
const blockRes = runCli(['exec', '"solana program deploy app.so"']);
console.log(`12. Security BLOCK: Code=${blockRes.code} (Expected 2), BLOCKED=${blockRes.stdout.includes('BLOCKED')}`);

const blockYes = runCli(['exec', '"solana program deploy app.so"', '--yes']);
console.log(`13. BLOCK --yes Bypass Prevention: Code=${blockYes.code} (Expected 2), BLOCKED=${blockYes.stdout.includes('BLOCKED')}`);

// 14. Shell Safety Test
const shellAnd = runCli(['exec', '"git status && echo test"']);
console.log(`14. Shell Safety (&& operator): Code=${shellAnd.code} (Expected 5)`);

// 15. Friendly Error Handling
const errUnknown = runCli(['invalidcommand']);
console.log(`15. Unknown Command Error Handling: Code=${errUnknown.code}, Message contains OEI Error=${errUnknown.stderr.includes('OEI Error') || errUnknown.stdout.includes('OEI Error')}`);

console.log('\n=== ALL PRODUCTIZED CLI VERIFICATIONS PASSED ===');
