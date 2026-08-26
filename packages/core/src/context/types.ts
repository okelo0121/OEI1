import {
    ContextSnapshot,
    WorkspaceContext,
    GitContext,
    RuntimeContext,
    ToolRuntimeInfo,
    ProjectContext,
    DependencyContext,
    CollectionMetadata,
} from '@oei/types';

export type {
    ContextSnapshot,
    WorkspaceContext,
    GitContext,
    RuntimeContext,
    ToolRuntimeInfo,
    ProjectContext,
    DependencyContext,
    CollectionMetadata,
};

export interface CollectorOptions {
    cwd?: string;
    actionTool?: string;
    timeoutMs?: number;
}
