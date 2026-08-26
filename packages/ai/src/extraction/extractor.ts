import { KnowledgeDocument } from '@oei/types';
import { AIProvider, createAIProvider } from '../providers/provider.js';
import { ExtractionResult, ExtractionResultSchema } from './schemas.js';

export class AIExtractor {
    constructor(private provider: AIProvider = createAIProvider()) { }

    async extract(document: KnowledgeDocument): Promise<ExtractionResult> {
        try {
            const rawResult = await this.provider.extractKnowledge(document);
            // Parse through Zod validation
            const validated = ExtractionResultSchema.parse(rawResult);
            return validated;
        } catch (error) {
            console.error(`[AIExtractor] Extraction failed for document ${document.id}:`, error);
            // Return empty result rather than crashing
            return {
                facts: [],
                notes: `Extraction failed: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}
