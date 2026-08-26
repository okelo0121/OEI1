import { ContextCollector } from './collector.js';
import { Action } from '@oei/types';
import { CollectorOptions, ContextSnapshot } from './types.js';

export * from './types.js';
export { SafetyGuard } from './safety.js';
export { WorkspaceCollector } from './workspace.js';
export { GitCollector } from './git.js';
export { RuntimeCollector } from './runtime.js';
export { ProjectCollector } from './project.js';
export { DependencyCollector } from './dependencies.js';
export { ContextCollector } from './collector.js';

export function collectContext(action?: Action, options?: CollectorOptions): ContextSnapshot {
    return ContextCollector.collect(action, options);
}
