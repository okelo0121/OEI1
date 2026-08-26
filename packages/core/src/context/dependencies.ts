import fs from 'node:fs';
import path from 'node:path';
import { DependencyContext } from './types.js';
import { SafetyGuard } from './safety.js';

export class DependencyCollector {
    static collect(projectRoot: string): DependencyContext {
        const manifestsAnalyzed: string[] = [];
        const dependenciesSet = new Set<string>();

        // Check package.json safely
        const pkgPath = path.join(projectRoot, 'package.json');
        if (fs.existsSync(pkgPath) && !SafetyGuard.isPathProtected('package.json')) {
            try {
                const content = fs.readFileSync(pkgPath, 'utf8');
                const parsed = JSON.parse(content);

                if (parsed.dependencies && typeof parsed.dependencies === 'object') {
                    Object.keys(parsed.dependencies).forEach(dep => dependenciesSet.add(dep));
                }
                if (parsed.devDependencies && typeof parsed.devDependencies === 'object') {
                    Object.keys(parsed.devDependencies).forEach(dep => dependenciesSet.add(dep));
                }
                manifestsAnalyzed.push('package.json');
            } catch {
                // Ignore parse errors silently
            }
        }

        // Check Cargo.toml safely
        const cargoPath = path.join(projectRoot, 'Cargo.toml');
        if (fs.existsSync(cargoPath) && !SafetyGuard.isPathProtected('Cargo.toml')) {
            try {
                const content = fs.readFileSync(cargoPath, 'utf8');
                const matches = content.matchAll(/^\[(?:dev-)?dependencies(?:\.[^\]]+)?\]\s*([\s\S]*?)(?=\n\[|$)/gm);

                for (const match of matches) {
                    const block = match[1];
                    const lines = block.split('\n');
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed && !trimmed.startsWith('#')) {
                            const eqIdx = trimmed.indexOf('=');
                            if (eqIdx > 0) {
                                const depName = trimmed.slice(0, eqIdx).trim();
                                if (depName) dependenciesSet.add(depName);
                            }
                        }
                    }
                }
                manifestsAnalyzed.push('Cargo.toml');
            } catch {
                // Ignore parse errors silently
            }
        }

        const directDependencies = Array.from(dependenciesSet).slice(0, 50);

        return {
            directDependencies,
            manifestsAnalyzed,
        };
    }
}
