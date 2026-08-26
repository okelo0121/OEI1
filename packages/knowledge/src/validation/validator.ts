import { createHash } from 'crypto';
import { Evidence, KnowledgeFact, KnowledgeDocument, KnowledgeSource } from '@oei/types';
import { RawFact, RawFactSchema } from '@oei/ai';
import { calculateFactConfidence } from './confidence.js';

export interface ValidationResult {
    valid: boolean;
    fact?: KnowledgeFact;
    errors?: string[];
}

export class FactValidator {
    validateAndTransform(
        rawFact: RawFact,
        doc: KnowledgeDocument,
        source: KnowledgeSource
    ): ValidationResult {
        const errors: string[] = [];

        // 1. Zod schema validation
        const parseResult = RawFactSchema.safeParse(rawFact);
        if (!parseResult.success) {
            return {
                valid: false,
                errors: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
            };
        }

        const data = parseResult.data;

        // 2. Validate required evidence
        if (!data.snippet || data.snippet.trim().length < 3) {
            errors.push('Fact missing required supporting snippet evidence from source text.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        // 3. Construct Evidence object preserving relationship to original source
        const evidence: Evidence = {
            sourceId: source.id,
            sourceUrl: doc.url || source.url,
            sourceTitle: source.title,
            contentHash: doc.contentHash,
            snippet: data.snippet.trim(),
            publishedAt: doc.publishedAt || source.publishedAt,
            authority: source.authority,
        };

        // 4. Calculate deterministic confidence score
        const confidence = calculateFactConfidence(
            source.authority,
            data.aiConfidence,
            Boolean(data.snippet && data.snippet.length > 5)
        );

        // 5. Deterministic fact ID based on content hash to prevent duplicate entries
        const rawHash = createHash('sha256')
            .update(`${source.id}:${data.subject.toLowerCase().trim()}:${data.factType}:${data.statement.trim()}`)
            .digest('hex')
            .substring(0, 12);

        const factId = `fact_${source.id}_${rawHash}`;

        const fact: KnowledgeFact = {
            id: factId,
            subject: data.subject.toLowerCase().trim(),
            subjectType: data.subjectType,
            factType: data.factType,
            statement: data.statement.trim(),
            impact: data.impact.trim(),
            severity: data.severity,
            affectedVersions: data.affectedVersions,
            fixedVersions: data.fixedVersions,
            sourceId: source.id,
            evidence,
            confidence,
            extractedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return { valid: true, fact };
    }
}
