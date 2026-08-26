import fs from 'node:fs';
import path from 'node:path';
import { ProjectContext } from './types.js';

export class ProjectCollector {
    static collect(projectRoot: string): ProjectContext {
        const manifestsToCheck = [
            'package.json',
            'Cargo.toml',
            'Anchor.toml',
            'pnpm-lock.yaml',
            'pnpm-workspace.yaml',
            'package-lock.json',
            'yarn.lock',
            'Cargo.lock',
        ];

        const manifestsFound: string[] = [];

        for (const file of manifestsToCheck) {
            if (fs.existsSync(path.join(projectRoot, file))) {
                manifestsFound.push(file);
            }
        }

        const hasPackageJson = manifestsFound.includes('package.json');
        const hasCargoToml = manifestsFound.includes('Cargo.toml');
        const hasAnchorToml = manifestsFound.includes('Anchor.toml');

        let projectType: ProjectContext['projectType'] = 'unknown';
        let primaryLanguage: string | undefined;

        if (hasAnchorToml) {
            projectType = 'anchor';
            primaryLanguage = 'Rust / TypeScript';
        } else if (hasCargoToml && hasPackageJson) {
            projectType = 'monorepo';
            primaryLanguage = 'TypeScript / Rust';
        } else if (hasCargoToml) {
            projectType = 'cargo';
            primaryLanguage = 'Rust';
        } else if (hasPackageJson) {
            projectType = 'node';
            primaryLanguage = 'TypeScript / JavaScript';
        }

        let packageManager: ProjectContext['packageManager'] = 'unknown';
        if (manifestsFound.includes('pnpm-lock.yaml') || manifestsFound.includes('pnpm-workspace.yaml')) {
            packageManager = 'pnpm';
        } else if (manifestsFound.includes('package-lock.json')) {
            packageManager = 'npm';
        } else if (manifestsFound.includes('yarn.lock')) {
            packageManager = 'yarn';
        } else if (hasCargoToml) {
            packageManager = 'cargo';
        }

        return {
            projectType,
            packageManager,
            primaryLanguage,
            manifestsFound,
            hasPackageJson,
            hasCargoToml,
            hasAnchorToml,
        };
    }
}
