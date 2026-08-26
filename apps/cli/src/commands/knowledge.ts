import { Command } from 'commander';
import { KnowledgeService } from '@oei/knowledge';

export function registerKnowledgeCommands(program: Command, service: KnowledgeService) {
    const knowledgeGroup = program
        .command('knowledge')
        .description('Manage OEI Knowledge Engine sources, synchronization, and query facts');

    // 1. oei knowledge sources
    knowledgeGroup
        .command('sources')
        .description('List registered trusted knowledge sources')
        .action(async () => {
            const sources = service.registry.listSources();
            console.log('\n=== Registered OEI Knowledge Sources ===\n');
            sources.forEach((s) => {
                const status = s.enabled ? '✓ ENABLED' : '✗ DISABLED';
                console.log(`[${s.id}] ${s.title}`);
                console.log(`  URL:       ${s.url}`);
                console.log(`  Type:      ${s.type} | Authority: ${s.authority.toUpperCase()} | Publisher: ${s.publisher}`);
                console.log(`  Status:    ${status}`);
                if (s.fetchedAt) {
                    console.log(`  Last Sync: ${s.fetchedAt}`);
                }
                console.log('');
            });
        });

    // 2. oei knowledge sync [sourceId] [--dry-run]
    knowledgeGroup
        .command('sync [sourceId]')
        .option('-d, --dry-run', 'Run synchronization pipeline without writing to persistent storage')
        .description('Synchronize knowledge sources (fetch -> normalize -> extract -> validate -> store)')
        .action(async (sourceId?: string, options?: { dryRun?: boolean }) => {
            const isDryRun = Boolean(options?.dryRun);
            console.log(`\n=== OEI Knowledge Engine Synchronization ${isDryRun ? '[DRY-RUN MODE]' : ''} ===\n`);

            if (sourceId) {
                console.log(`Synchronizing specific source: ${sourceId}...`);
                const stats = await service.syncSource(sourceId, isDryRun);

                if (isDryRun && stats.extractedFacts && stats.extractedFacts.length > 0) {
                    console.log(`\n--- [DRY-RUN RESULT PREVIEW] Extracted ${stats.extractedFacts.length} Facts ---`);
                    stats.extractedFacts.forEach((fact, idx) => {
                        console.log(`  Fact #${idx + 1}: [${fact.severity.toUpperCase()}] ${fact.statement}`);
                        console.log(`    Subject:     ${fact.subject} (${fact.subjectType})`);
                        console.log(`    Impact:      ${fact.impact}`);
                        console.log(`    Confidence:  ${(fact.confidence * 100).toFixed(0)}% (${fact.evidence.authority.toUpperCase()} source)`);
                        console.log(`    Evidence:    "${fact.evidence.snippet}"`);
                        console.log(`    Source URL:  ${fact.evidence.sourceUrl}`);
                    });
                    console.log(`----------------------------------------------------------\n`);
                }

                console.log(`Sync complete! Processed ${stats.sourcesProcessed} source, extracted ${stats.factsExtracted} verified facts, stored ${stats.factsStored} facts.`);
            } else {
                const stats = await service.syncAllSources(isDryRun);
                if (isDryRun && stats.extractedFacts && stats.extractedFacts.length > 0) {
                    console.log(`\n--- [DRY-RUN RESULT PREVIEW] Extracted ${stats.extractedFacts.length} Total Facts ---`);
                    stats.extractedFacts.forEach((fact, idx) => {
                        console.log(`  Fact #${idx + 1}: [${fact.severity.toUpperCase()}] ${fact.statement}`);
                        console.log(`    Evidence: "${fact.evidence.snippet}" (${fact.evidence.sourceUrl})`);
                    });
                    console.log(`----------------------------------------------------------\n`);
                }
            }
        });

    // 3. oei knowledge search <query>
    knowledgeGroup
        .command('search <query>')
        .description('Search stored KnowledgeFacts by subject, keywords, severity, or evidence')
        .action(async (query: string) => {
            console.log(`\n=== OEI Knowledge Search Results for: "${query}" ===\n`);
            const facts = await service.searchFacts(query);

            if (facts.length === 0) {
                console.log('No matching verified facts found in Knowledge Store.');
                console.log('Tip: Run "oei knowledge sync" to populate the knowledge engine.\n');
                return;
            }

            facts.forEach((fact, idx) => {
                console.log(`[Fact #${idx + 1}] ID: ${fact.id}`);
                console.log(`  Subject:     ${fact.subject} (${fact.subjectType})`);
                console.log(`  Fact Type:   ${fact.factType}`);
                console.log(`  Statement:   ${fact.statement}`);
                console.log(`  Impact:      ${fact.impact}`);
                console.log(`  Severity:    ${fact.severity.toUpperCase()}`);
                console.log(`  Confidence:  ${(fact.confidence * 100).toFixed(0)}% (${fact.evidence.authority.toUpperCase()} source)`);
                if (fact.affectedVersions?.raw) {
                    console.log(`  Affected:    ${fact.affectedVersions.raw}`);
                }
                console.log(`  Evidence:    "${fact.evidence.snippet}"`);
                console.log(`  Source URL:  ${fact.evidence.sourceUrl}`);
                console.log('');
            });
        });
}
