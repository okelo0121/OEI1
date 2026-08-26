import { KnowledgeDocument, KnowledgeFact, KnowledgeSource } from '@oei/types';
import { AIExtractor } from '@oei/ai';
import { DocumentNormalizer } from '../documents/normalizer.js';
import { FactValidator } from '../validation/validator.js';

export interface PipelineResult {
    document: KnowledgeDocument;
    facts: KnowledgeFact[];
    errors: string[];
}

export class ExtractionPipeline {
    constructor(
        private normalizer: DocumentNormalizer = new DocumentNormalizer(),
        private aiExtractor: AIExtractor = new AIExtractor(),
        private validator: FactValidator = new FactValidator()
    ) { }

    async process(doc: KnowledgeDocument, source: KnowledgeSource): Promise<PipelineResult> {
        const errors: string[] = [];

        // Step 1: Normalize Document
        const normalizedDoc = this.normalizer.normalize(doc);

        // Step 2: AI Extraction
        const extractionResult = await this.aiExtractor.extract(normalizedDoc);

        // Step 3: Validate and Transform Raw Facts to KnowledgeFacts
        const facts: KnowledgeFact[] = [];
        for (const rawFact of extractionResult.facts) {
            const valResult = this.validator.validateAndTransform(rawFact, normalizedDoc, source);
            if (valResult.valid && valResult.fact) {
                facts.push(valResult.fact);
            } else if (valResult.errors) {
                errors.push(...valResult.errors);
            }
        }

        return {
            document: normalizedDoc,
            facts,
            errors,
        };
    }
}
