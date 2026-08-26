import { Action, ContextSnapshot, KnowledgeFact, KnowledgeMatch, KnowledgeSource } from '@oei/types';
import { ExtractionPipeline } from './extraction/pipeline.js';
import { KnowledgeRetriever } from './retrieval/retriever.js';
import { SourceFetcher } from './sources/fetcher.js';
import { SourceRegistry } from './sources/registry.js';
import { JsonRepository } from './storage/json-repository.js';
import { KnowledgeRepository } from './storage/repository.js';

export interface SyncStats {
    sourcesProcessed: number;
    documentsFetched: number;
    factsExtracted: number;
    factsStored: number;
    dryRun: boolean;
    errors: string[];
    extractedFacts?: KnowledgeFact[];
}

export class KnowledgeService {
    public registry: SourceRegistry;
    public fetcher: SourceFetcher;
    public pipeline: ExtractionPipeline;
    public repository: KnowledgeRepository;
    public retriever: KnowledgeRetriever;

    constructor(
        registry?: SourceRegistry,
        repository?: KnowledgeRepository,
        fetcher?: SourceFetcher,
        pipeline?: ExtractionPipeline
    ) {
        this.registry = registry || new SourceRegistry();
        this.repository = repository || new JsonRepository();
        this.fetcher = fetcher || new SourceFetcher();
        this.pipeline = pipeline || new ExtractionPipeline();
        this.retriever = new KnowledgeRetriever(this.repository);
    }

    async syncSource(sourceId: string, dryRun: boolean = false): Promise<SyncStats> {
        const stats: SyncStats = {
            sourcesProcessed: 0,
            documentsFetched: 0,
            factsExtracted: 0,
            factsStored: 0,
            dryRun,
            errors: [],
            extractedFacts: [],
        };

        // STAGE 1: SOURCE
        const source = this.registry.getSource(sourceId);
        if (!source) {
            const err = `[SOURCE STAGE FAILED] Source with ID '${sourceId}' not found in registry.`;
            console.error(`  ❌ ${err}`);
            stats.errors.push(err);
            return stats;
        }

        if (!source.enabled) {
            console.log(`  [SOURCE] ${source.title} (${source.id}) is disabled. Skipping sync.`);
            return stats;
        }

        console.log(`\n  ► STAGE 1 [SOURCE]: ${source.title} (${source.id})`);
        console.log(`    URL: ${source.url} | Authority: ${source.authority.toUpperCase()}`);
        stats.sourcesProcessed++;

        // STAGE 2: FETCH
        console.log(`  ► STAGE 2 [FETCH]: Fetching content from source...`);
        let rawDoc;
        try {
            rawDoc = await this.fetcher.fetch(source);
            stats.documentsFetched++;
            console.log(`    ✓ Fetched document hash: ${rawDoc.contentHash.substring(0, 16)}...`);
        } catch (fetchError) {
            const err = `[FETCH STAGE FAILED] Failed to fetch content for ${source.id}: ${fetchError}`;
            console.error(`  ❌ ${err}`);
            stats.errors.push(err);
            return stats;
        }

        // STAGE 3: NORMALIZE & STAGE 4: EXTRACT & STAGE 5: VALIDATE
        console.log(`  ► STAGE 3 [NORMALIZE]: Normalizing markup & preserving code blocks...`);
        console.log(`  ► STAGE 4 [EXTRACT]: Running AI extraction pipeline...`);
        let pipelineResult;
        try {
            pipelineResult = await this.pipeline.process(rawDoc, source);
            if (pipelineResult.errors.length > 0) {
                stats.errors.push(...pipelineResult.errors);
            }
        } catch (extractError) {
            const err = `[EXTRACT STAGE FAILED] AI extraction pipeline failed for ${source.id}: ${extractError}`;
            console.error(`  ❌ ${err}`);
            stats.errors.push(err);
            return stats;
        }

        const { document, facts } = pipelineResult;
        stats.factsExtracted = facts.length;
        stats.extractedFacts = facts;

        console.log(`  ► STAGE 5 [VALIDATE]: Validated ${facts.length} KnowledgeFacts against Zod schemas and confidence bounds.`);

        // STAGE 6: STORE
        if (dryRun) {
            console.log(`  ► STAGE 6 [STORE]: [DRY-RUN ACTIVE] Skipping filesystem storage mutation.`);
        } else {
            console.log(`  ► STAGE 6 [STORE]: Persisting source, document, and ${facts.length} facts to Knowledge Store...`);
            try {
                await this.repository.saveSource(source);
                await this.repository.saveDocument(document);
                await this.repository.saveFacts(facts);
                stats.factsStored += facts.length;

                this.registry.updateSource(source.id, {
                    fetchedAt: new Date().toISOString(),
                    contentHash: document.contentHash,
                });
                console.log(`    ✓ Successfully stored ${facts.length} verified facts for ${source.id}.`);
            } catch (storeError) {
                const err = `[STORE STAGE FAILED] Failed to save facts to repository for ${source.id}: ${storeError}`;
                console.error(`  ❌ ${err}`);
                stats.errors.push(err);
                return stats;
            }
        }

        return stats;
    }

    async syncAllSources(dryRun: boolean = false): Promise<SyncStats> {
        const overallStats: SyncStats = {
            sourcesProcessed: 0,
            documentsFetched: 0,
            factsExtracted: 0,
            factsStored: 0,
            dryRun,
            errors: [],
            extractedFacts: [],
        };

        const sources = this.registry.listSources(true);
        console.log(`[KnowledgeService] Starting synchronization of ${sources.length} active sources (Dry Run: ${dryRun ? 'YES' : 'NO'})...\n`);

        for (const source of sources) {
            const stats = await this.syncSource(source.id, dryRun);
            overallStats.sourcesProcessed += stats.sourcesProcessed;
            overallStats.documentsFetched += stats.documentsFetched;
            overallStats.factsExtracted += stats.factsExtracted;
            overallStats.factsStored += stats.factsStored;
            overallStats.errors.push(...stats.errors);
            if (stats.extractedFacts) {
                overallStats.extractedFacts?.push(...stats.extractedFacts);
            }
        }

        console.log(`\n[KnowledgeService] Sync complete! Processed ${overallStats.sourcesProcessed} sources, extracted ${overallStats.factsExtracted} facts, stored ${overallStats.factsStored} facts.`);
        return overallStats;
    }

    async searchFacts(query: string): Promise<KnowledgeFact[]> {
        return this.retriever.search(query);
    }

    async matchActionContext(action: Action, context: ContextSnapshot): Promise<KnowledgeMatch[]> {
        return this.retriever.matchActionContext(action, context, this.registry);
    }
}

