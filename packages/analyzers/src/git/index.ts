export class GitAnalyzer {
    name = 'GitAnalyzer';
    supports(cmd: string): boolean {
        return cmd.trim().startsWith('git');
    }
}
