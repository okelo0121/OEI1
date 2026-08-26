export interface WorkspaceContext {
    cwd: string;
    projectRoot: string;
    operatingSystem: string;
    architecture: string;
    configFilesFound: string[];
}

export interface GitContext {
    isGitRepository: boolean;
    branch?: string;
    workingTreeClean?: boolean;
    changedFiles?: string[];
    stagedFiles?: string[];
    unstagedFiles?: string[];
    error?: string;
}

export interface ToolRuntimeInfo {
    available: boolean;
    version?: string;
}

export interface RuntimeContext {
    node?: ToolRuntimeInfo;
    npm?: ToolRuntimeInfo;
    rust?: ToolRuntimeInfo;
    cargo?: ToolRuntimeInfo;
    solana?: ToolRuntimeInfo;
}

export interface ProjectContext {
    projectType: 'anchor' | 'cargo' | 'node' | 'monorepo' | 'unknown';
    packageManager?: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'unknown';
    primaryLanguage?: string;
    manifestsFound: string[];
    hasPackageJson: boolean;
    hasCargoToml: boolean;
    hasAnchorToml: boolean;
}

export interface DependencyContext {
    directDependencies?: string[];
    manifestsAnalyzed: string[];
}

export interface CollectionMetadata {
    timestamp: string;
    durationMs: number;
    collectorsRun: string[];
    collectorsFailed: string[];
}

export interface ContextSnapshot {
    workspace: WorkspaceContext;
    git: GitContext;
    runtime: RuntimeContext;
    project: ProjectContext;
    dependencies: DependencyContext;
    collectionMetadata: CollectionMetadata;
}
