import { Action, ContextSnapshot, KnowledgeFact, KnowledgeMatch } from '@oei/types';
import { FactSearchFilter, KnowledgeRepository } from '../storage/repository.js';
import { KnowledgeMatcher } from './matcher.js';
import { SourceRegistry } from '../sources/registry.js';

export interface SearchOptions extends FactSearchFilter {
    limit?: number;
}

export class KnowledgeRetriever {
    constructor(private repository: KnowledgeRepository) { }

    async matchActionContext(
        action: Action,
        context: ContextSnapshot,
        registry?: SourceRegistry
    ): Promise<KnowledgeMatch[]> {
        const allFacts = await this.repository.listFacts();
        const matcher = new KnowledgeMatcher(registry);
        return matcher.match(allFacts, action, context);
    }


    async search(queryOrOptions: string | SearchOptions): Promise<KnowledgeFact[]> {
        const filter: SearchOptions = typeof queryOrOptions === 'string'
            ? { query: queryOrOptions }
            : queryOrOptions;

        const results = await this.repository.findFacts(filter);

        // Sort by confidence descending, then severity rank
        const severityRank: Record<string, number> = {
            critical: 5,
            high: 4,
            medium: 3,
            low: 2,
            info: 1,
            unknown: 0,
        };

        results.sort((a, b) => {
            if (b.confidence !== a.confidence) {
                return b.confidence - a.confidence;
            }
            return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
        });

        if (filter.limit && filter.limit > 0) {
            return results.slice(0, filter.limit);
        }

        return results;
    }

    async getFactsForSubject(subject: string): Promise<KnowledgeFact[]> {
        return this.search({ subject });
    }
}

