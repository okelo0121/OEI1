import { Action, ContextSnapshot, KnowledgeFact, KnowledgeMatch, VersionMatchStatus } from '@oei/types';
import { SourceRegistry } from '../sources/registry.js';

export class KnowledgeMatcher {
    constructor(private registry?: SourceRegistry) { }

    /**
     * Match stored KnowledgeFacts against an Action and ContextSnapshot.
     */
    match(
        facts: KnowledgeFact[],
        action: Action,
        context: ContextSnapshot
    ): KnowledgeMatch[] {
        if (!facts || facts.length === 0 || !action) {
            return [];
        }

        const matches: KnowledgeMatch[] = [];

        for (const fact of facts) {
            const matchResult = this.evaluateFact(fact, action, context);
            if (matchResult.relevanceScore > 0.1) {
                matches.push(matchResult);
            }
        }

        return this.sortMatches(matches);
    }

    private evaluateFact(
        fact: KnowledgeFact,
        action: Action,
        context: ContextSnapshot
    ): KnowledgeMatch {
        const matchReasons: string[] = [];
        let relevanceScore = 0.0;

        const tool = (action.tool || '').toLowerCase();
        const operation = (action.operation || '').toLowerCase();
        const category = (action.category || '').toLowerCase();
        const subject = (fact.subject || '').toLowerCase();
        const statement = (fact.statement || '').toLowerCase();
        const impact = (fact.impact || '').toLowerCase();
        const factType = (fact.factType || '').toLowerCase();

        // 1. Tool / Subject Match (+0.40)
        if (tool !== 'unknown' && (subject.includes(tool) || tool.includes(subject) || fact.subjectType.toLowerCase() === tool)) {
            relevanceScore += 0.40;
            matchReasons.push('tool-match');
        }

        // 2. Operation Match (+0.25)
        if (operation !== 'unknown' && operation.length > 0) {
            const opTokens = operation.split(/\s+/);
            const matchesOp = opTokens.some(tok => statement.includes(tok) || impact.includes(tok) || factType.includes(tok));
            if (matchesOp) {
                relevanceScore += 0.25;
                matchReasons.push('operation-match');
            }
        }

        // 3. Category Match (+0.15)
        if (category !== 'unknown' && (statement.includes(category) || factType.includes(category))) {
            relevanceScore += 0.15;
            matchReasons.push('category-match');
        }

        // 4. Context Project Match (+0.10)
        if (context.project.projectType !== 'unknown') {
            const pType = context.project.projectType.toLowerCase();
            if (statement.includes(pType) || impact.includes(pType)) {
                relevanceScore += 0.10;
                matchReasons.push('context-project-match');
            }
        }

        // 5. Source Authority Lookup
        let authority: KnowledgeMatch['authority'] = 'unknown';
        if (this.registry) {
            const src = this.registry.getSource(fact.sourceId);
            if (src) {
                authority = src.authority as KnowledgeMatch['authority'];
            }
        }
        if (authority === 'unknown' && fact.evidence?.authority) {
            authority = fact.evidence.authority as KnowledgeMatch['authority'];
        }
        if (authority === 'official') {
            relevanceScore += 0.05;
            matchReasons.push('official-source');
        } else if (authority === 'trusted') {
            matchReasons.push('trusted-source');
        }

        // 6. Version Matching
        const versionMatch = this.evaluateVersionMatch(fact, action, context);
        if (versionMatch === 'affected') {
            relevanceScore += 0.15;
            matchReasons.push('version-match');
        }

        // Normalize score between 0.0 and 1.0
        const finalScore = Math.min(1.0, Math.max(0.0, Number(relevanceScore.toFixed(2))));

        return {
            fact,
            relevanceScore: finalScore,
            matchReasons,
            versionMatch,
            authority,
        };
    }

    private evaluateVersionMatch(
        fact: KnowledgeFact,
        action: Action,
        context: ContextSnapshot
    ): VersionMatchStatus {
        if (!fact.affectedVersions) {
            return 'unknown';
        }

        const tool = (action.tool || '').toLowerCase();
        let runtimeVersion: string | undefined;

        if (tool === 'solana' && context.runtime.solana?.available) {
            runtimeVersion = context.runtime.solana.version;
        } else if (tool === 'npm' && context.runtime.npm?.available) {
            runtimeVersion = context.runtime.npm.version;
        } else if (tool === 'node' && context.runtime.node?.available) {
            runtimeVersion = context.runtime.node.version;
        } else if ((tool === 'cargo' || tool === 'rust') && context.runtime.cargo?.available) {
            runtimeVersion = context.runtime.cargo.version;
        }

        if (!runtimeVersion) {
            return 'unknown';
        }

        const range = fact.affectedVersions;
        const raw = (range.raw || '').trim();

        if (raw === '*' || raw.includes(runtimeVersion)) {
            return 'affected';
        }

        if (range.maxVersion) {
            if (this.compareVersions(runtimeVersion, range.maxVersion) < 0) {
                return 'affected';
            }
            return 'not-affected';
        }

        if (range.minVersion) {
            if (this.compareVersions(runtimeVersion, range.minVersion) >= 0) {
                return 'affected';
            }
            return 'not-affected';
        }

        if (range.exactVersion) {
            return runtimeVersion === range.exactVersion ? 'affected' : 'not-affected';
        }

        return 'unknown';
    }

    private compareVersions(v1: string, v2: string): number {
        const clean1 = v1.replace(/[^\d.]/g, '').split('.').map(Number);
        const clean2 = v2.replace(/[^\d.]/g, '').split('.').map(Number);
        const len = Math.max(clean1.length, clean2.length);

        for (let i = 0; i < len; i++) {
            const n1 = clean1[i] || 0;
            const n2 = clean2[i] || 0;
            if (n1 > n2) return 1;
            if (n1 < n2) return -1;
        }
        return 0;
    }

    private sortMatches(matches: KnowledgeMatch[]): KnowledgeMatch[] {
        const versionRank: Record<VersionMatchStatus, number> = {
            affected: 3,
            unknown: 2,
            'not-affected': 1,
        };

        const severityRank: Record<string, number> = {
            critical: 5,
            high: 4,
            medium: 3,
            low: 2,
            info: 1,
            unknown: 0,
        };

        const authorityRank: Record<KnowledgeMatch['authority'], number> = {
            official: 3,
            trusted: 2,
            community: 1,
            unknown: 0,
        };

        return matches.sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            if (versionRank[b.versionMatch] !== versionRank[a.versionMatch]) {
                return versionRank[b.versionMatch] - versionRank[a.versionMatch];
            }
            if ((severityRank[b.fact.severity] || 0) !== (severityRank[a.fact.severity] || 0)) {
                return (severityRank[b.fact.severity] || 0) - (severityRank[a.fact.severity] || 0);
            }
            return authorityRank[b.authority] - authorityRank[a.authority];
        });
    }
}
