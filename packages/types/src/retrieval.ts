import { KnowledgeFact } from './knowledge.js';

export type VersionMatchStatus = 'affected' | 'not-affected' | 'unknown';

export interface KnowledgeMatch {
    fact: KnowledgeFact;
    relevanceScore: number;
    matchReasons: string[];
    versionMatch: VersionMatchStatus;
    authority: 'official' | 'trusted' | 'community' | 'unknown';
}
