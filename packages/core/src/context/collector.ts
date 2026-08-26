import { Action } from '@oei/types';
import {
    ContextSnapshot,
    WorkspaceContext,
    GitContext,
    RuntimeContext,
    ProjectContext,
    DependencyContext,
    CollectionMetadata,
    CollectorOptions,
} from './types.js';
import { WorkspaceCollector } from './workspace.js';
import { GitCollector } from './git.js';
import { RuntimeCollector } from './runtime.js';
import { ProjectCollector } from './project.js';
import { DependencyCollector } from './dependencies.js';

export class ContextCollector {
    /**
     * Collect a complete, action-aware, failure-tolerant ContextSnapshot.
     */
    static collect(action?: Action, options?: CollectorOptions): ContextSnapshot {
        const startTime = Date.now();
        const cwd = options?.cwd || process.cwd();
        const actionTool = action?.tool;

        const collectorsRun: string[] = [];
        const collectorsFailed: string[] = [];

        // 1. Workspace Context
        collectorsRun.push('WorkspaceCollector');
        let workspace: WorkspaceContext;
        try {
            workspace = WorkspaceCollector.collect(cwd);
        } catch {
            collectorsFailed.push('WorkspaceCollector');
            workspace = {
                cwd,
                projectRoot: cwd,
                operatingSystem: process.platform,
                architecture: process.arch,
                configFilesFound: [],
            };
        }

        // 2. Git Context
        collectorsRun.push('GitCollector');
        let git: GitContext;
        try {
            git = GitCollector.collect(workspace.projectRoot);
        } catch (err: any) {
            collectorsFailed.push('GitCollector');
            git = {
                isGitRepository: false,
                error: err?.message || 'Git collector failed',
            };
        }

        // 3. Runtime Context
        collectorsRun.push('RuntimeCollector');
        let runtime: RuntimeContext;
        try {
            runtime = RuntimeCollector.collect(actionTool);
        } catch {
            collectorsFailed.push('RuntimeCollector');
            runtime = {};
        }

        // 4. Project Context
        collectorsRun.push('ProjectCollector');
        let project: ProjectContext;
        try {
            project = ProjectCollector.collect(workspace.projectRoot);
        } catch {
            collectorsFailed.push('ProjectCollector');
            project = {
                projectType: 'unknown',
                manifestsFound: [],
                hasPackageJson: false,
                hasCargoToml: false,
                hasAnchorToml: false,
            };
        }

        // 5. Dependency Context
        collectorsRun.push('DependencyCollector');
        let dependencies: DependencyContext;
        try {
            dependencies = DependencyCollector.collect(workspace.projectRoot);
        } catch {
            collectorsFailed.push('DependencyCollector');
            dependencies = {
                manifestsAnalyzed: [],
            };
        }

        const durationMs = Date.now() - startTime;
        const collectionMetadata: CollectionMetadata = {
            timestamp: new Date().toISOString(),
            durationMs,
            collectorsRun,
            collectorsFailed,
        };

        return {
            workspace,
            git,
            runtime,
            project,
            dependencies,
            collectionMetadata,
        };
    }
}
