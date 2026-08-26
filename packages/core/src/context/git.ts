import { execSync } from 'node:child_process';
import { GitContext } from './types.js';
import { SafetyGuard } from './safety.js';

export class GitCollector {
    static collect(targetCwd?: string): GitContext {
        const cwd = targetCwd || process.cwd();

        try {
            const isRepo = this.runGitCmd('rev-parse --is-inside-work-tree', cwd).trim() === 'true';

            if (!isRepo) {
                return { isGitRepository: false };
            }

            let branch = 'HEAD';
            try {
                branch = this.runGitCmd('rev-parse --abbrev-ref HEAD', cwd).trim() || 'HEAD';
            } catch {
                branch = 'main (uncommitted)';
            }
            const statusOutput = this.runGitCmd('status --porcelain', cwd);

            const lines = statusOutput.split('\n').map(l => l.trimEnd()).filter(Boolean);
            const stagedFiles: string[] = [];
            const unstagedFiles: string[] = [];
            const changedFilesSet = new Set<string>();

            for (const line of lines) {
                if (line.length < 3) continue;
                const stagedCode = line[0];
                const unstagedCode = line[1];
                const filePath = line.slice(3).trim();

                if (SafetyGuard.isPathProtected(filePath)) {
                    continue; // Skip protected files from context collection
                }

                if (stagedCode !== ' ' && stagedCode !== '?') {
                    stagedFiles.push(filePath);
                    changedFilesSet.add(filePath);
                }

                if (unstagedCode !== ' ') {
                    unstagedFiles.push(filePath);
                    changedFilesSet.add(filePath);
                }
            }

            const changedFiles = Array.from(changedFilesSet);
            const workingTreeClean = lines.length === 0;

            return {
                isGitRepository: true,
                branch,
                workingTreeClean,
                changedFiles,
                stagedFiles,
                unstagedFiles,
            };
        } catch (err: any) {
            return {
                isGitRepository: false,
                error: err?.message || 'Not a git repository or git binary unavailable',
            };
        }
    }

    private static runGitCmd(args: string, cwd: string): string {
        return execSync(`git ${args}`, {
            cwd,
            timeout: 3000,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });
    }
}
