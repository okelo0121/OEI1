import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { WorkspaceContext } from './types.js';
import { SafetyGuard } from './safety.js';

export class WorkspaceCollector {
    static collect(targetCwd?: string): WorkspaceContext {
        const cwd = path.resolve(targetCwd || process.cwd());
        const projectRoot = this.findProjectRoot(cwd);
        const configFilesFound = this.discoverConfigFiles(projectRoot);

        return {
            cwd,
            projectRoot,
            operatingSystem: os.platform(),
            architecture: os.arch(),
            configFilesFound,
        };
    }

    private static findProjectRoot(startDir: string): string {
        let current = startDir;

        while (current) {
            const rootIndicators = [
                '.git',
                'pnpm-workspace.yaml',
                'package.json',
                'Cargo.toml',
                'Anchor.toml',
            ];

            for (const indicator of rootIndicators) {
                if (fs.existsSync(path.join(current, indicator))) {
                    return current;
                }
            }

            const parent = path.dirname(current);
            if (parent === current) break;
            current = parent;
        }

        return startDir;
    }

    private static discoverConfigFiles(dir: string): string[] {
        const safeConfigs = [
            'tsconfig.json',
            'vite.config.ts',
            'vite.config.js',
            'pnpm-workspace.yaml',
            'package.json',
            'Cargo.toml',
            'Anchor.toml',
            'README.md',
        ];

        const found: string[] = [];

        for (const file of safeConfigs) {
            if (SafetyGuard.isPathProtected(file)) continue;

            const fullPath = path.join(dir, file);
            if (fs.existsSync(fullPath)) {
                found.push(file);
            }
        }

        return found;
    }
}
