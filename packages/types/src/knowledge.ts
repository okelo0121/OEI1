import { Evidence } from './evidence.js';

export interface KnowledgeDocument {
    id: string;
    sourceId: string;
    url: string;
    title: string;
    content: string;
    contentHash: string;
    fetchedAt: string;
    publishedAt?: string;
    metadata?: Record<string, any>;
}

export type FactType =
    | 'behavior_change'
    | 'breaking_change'
    | 'security_issue'
    | 'compatibility'
    | 'deprecation'
    | 'bug'
    | 'feature'
    | 'best_practice'
    | 'release'
    | 'configuration_change';

export type Severity =
    | 'info'
    | 'low'
    | 'medium'
    | 'high'
    | 'critical'
    | 'unknown';

export interface VersionRange {
    minVersion?: string;
    maxVersion?: string;
    exactVersion?: string;
    raw?: string;
}

export interface KnowledgeFact {
    id: string;
    subject: string;
    subjectType: 'cli' | 'sdk' | 'package' | 'protocol' | 'framework' | 'tool';
    factType: FactType;
    statement: string;
    impact: string;
    severity: Severity;
    affectedVersions?: VersionRange;
    fixedVersions?: VersionRange;
    sourceId: string;
    evidence: Evidence;
    confidence: number;
    extractedAt: string;
    updatedAt: string;
}
