import { KnowledgeMatch } from '@oei/types';

export class MatchDeduplicator {
    /**
     * Deduplicate KnowledgeMatches to prevent artificial risk score inflation.
     */
    static deduplicate(matches: KnowledgeMatch[]): KnowledgeMatch[] {
        if (!matches || matches.length === 0) return [];

        const uniqueMap = new Map<string, KnowledgeMatch>();

        for (const match of matches) {
            // Key based on fact ID or statement content hash
            const key = match.fact.id || `${match.fact.sourceId}:${match.fact.statement.trim()}`;

            const existing = uniqueMap.get(key);
            if (!existing) {
                uniqueMap.set(key, match);
            } else {
                // Keep match with higher relevance score or confidence
                if (match.relevanceScore > existing.relevanceScore) {
                    uniqueMap.set(key, match);
                }
            }
        }

        return Array.from(uniqueMap.values());
    }
}
