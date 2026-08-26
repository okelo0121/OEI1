export class NpmAnalyzer {
    name = 'NpmAnalyzer';
    supports(cmd: string): boolean {
        return cmd.trim().startsWith('npm') || cmd.trim().startsWith('npx') || cmd.trim().startsWith('pnpm');
    }
}
