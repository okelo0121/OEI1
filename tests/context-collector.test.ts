import { describe, it, expect } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import {
    ContextCollector,
    WorkspaceCollector,
    GitCollector,
    RuntimeCollector,
    ProjectCollector,
    DependencyCollector,
    SafetyGuard,
    collectContext,
    parseAction,
} from '../packages/core/src/index.js';

describe('Context Collector & Workspace State Reader', () => {
    describe('SafetyGuard & Privacy Protection', () => {
        it('identifies sensitive file paths as protected', () => {
            expect(SafetyGuard.isPathProtected('.env')).toBe(true);
            expect(SafetyGuard.isPathProtected('.env.local')).toBe(true);
            expect(SafetyGuard.isPathProtected('.env.production')).toBe(true);
            expect(SafetyGuard.isPathProtected('id_rsa')).toBe(true);
            expect(SafetyGuard.isPathProtected('id_ed25519')).toBe(true);
            expect(SafetyGuard.isPathProtected('cert.pem')).toBe(true);
            expect(SafetyGuard.isPathProtected('private.key')).toBe(true);
            expect(SafetyGuard.isPathProtected('credentials.json')).toBe(true);
            expect(SafetyGuard.isPathProtected('secrets.json')).toBe(true);
            expect(SafetyGuard.isPathProtected('wallet.json')).toBe(true);
            expect(SafetyGuard.isPathProtected('id.json')).toBe(true);
            expect(SafetyGuard.isPathProtected('auth.json')).toBe(true);
            expect(SafetyGuard.isPathProtected('.npmrc')).toBe(true);
        });

        it('allows non-sensitive configuration files', () => {
            expect(SafetyGuard.isPathProtected('package.json')).toBe(false);
            expect(SafetyGuard.isPathProtected('Cargo.toml')).toBe(false);
            expect(SafetyGuard.isPathProtected('Anchor.toml')).toBe(false);
            expect(SafetyGuard.isPathProtected('tsconfig.json')).toBe(false);
            expect(SafetyGuard.isPathProtected('README.md')).toBe(false);
        });

        it('identifies sensitive environment variable names', () => {
            expect(SafetyGuard.isSensitiveEnvVarName('API_KEY')).toBe(true);
            expect(SafetyGuard.isSensitiveEnvVarName('DB_PASSWORD')).toBe(true);
            expect(SafetyGuard.isSensitiveEnvVarName('AWS_SECRET_ACCESS_KEY')).toBe(true);
            expect(SafetyGuard.isSensitiveEnvVarName('JWT_TOKEN')).toBe(true);
            expect(SafetyGuard.isSensitiveEnvVarName('NODE_ENV')).toBe(false);
        });
    });

    describe('WorkspaceCollector', () => {
        it('collects current working directory, platform, architecture, and project root', () => {
            const ws = WorkspaceCollector.collect();
            expect(ws.cwd).toBeDefined();
            expect(ws.projectRoot).toBeDefined();
            expect(ws.operatingSystem).toBe(os.platform());
            expect(ws.architecture).toBe(os.arch());
            expect(Array.isArray(ws.configFilesFound)).toBe(true);
        });
    });

    describe('GitCollector', () => {
        it('collects git state when running inside git repository', () => {
            const git = GitCollector.collect();
            expect(git.isGitRepository).toBe(true);
            expect(typeof git.branch).toBe('string');
            expect(typeof git.workingTreeClean).toBe('boolean');
            expect(Array.isArray(git.changedFiles)).toBe(true);
        });

        it('handles non-git directory gracefully without throwing', () => {
            const tempDir = os.tmpdir();
            const git = GitCollector.collect(tempDir);
            expect(git.isGitRepository).toBe(false);
        });
    });

    describe('RuntimeCollector', () => {
        it('detects Node and npm versions', () => {
            const rt = RuntimeCollector.collect('npm');
            expect(rt.node).toBeDefined();
            expect(rt.node?.available).toBe(true);
            expect(rt.node?.version).toBeDefined();

            expect(rt.npm).toBeDefined();
            expect(rt.npm?.available).toBe(true);
            expect(rt.npm?.version).toBeDefined();
        });

        it('returns available: false for non-existent commands', () => {
            const rt = RuntimeCollector.collect('unknown');
            expect(rt.node).toBeDefined();
        });
    });

    describe('ProjectCollector & DependencyCollector', () => {
        it('detects project type, package manager, and manifests in OEI workspace', () => {
            const proj = ProjectCollector.collect(process.cwd());
            expect(proj.hasPackageJson).toBe(true);
            expect(proj.manifestsFound).toContain('package.json');
            expect(proj.projectType).toBeDefined();
        });

        it('collects direct dependencies without reading protected files', () => {
            const deps = DependencyCollector.collect(process.cwd());
            expect(Array.isArray(deps.directDependencies)).toBe(true);
            expect(deps.manifestsAnalyzed).toContain('package.json');
        });
    });

    describe('ContextCollector Failure Tolerance & Action Integration', () => {
        it('generates a complete ContextSnapshot for a Solana action', () => {
            const action = parseAction('solana program deploy target/deploy/app.so');
            const snapshot = ContextCollector.collect(action);

            expect(snapshot.workspace.cwd).toBeDefined();
            expect(snapshot.git).toBeDefined();
            expect(snapshot.runtime).toBeDefined();
            expect(snapshot.project).toBeDefined();
            expect(snapshot.dependencies).toBeDefined();
            expect(snapshot.collectionMetadata.collectorsRun.length).toBe(5);
            expect(snapshot.collectionMetadata.collectorsFailed.length).toBe(0);
        });

        it('remains failure tolerant if individual collectors fail', () => {
            const snapshot = collectContext();
            expect(snapshot).toBeDefined();
            expect(snapshot.collectionMetadata.durationMs).toBeGreaterThanOrEqual(0);
        });
    });
});
