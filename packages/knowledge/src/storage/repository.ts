import { KnowledgeDocument, KnowledgeFact, KnowledgeSource } from '@oei/types';

export interface FactSearchFilter {
    subject?: string;
    subjectType?: string;
    factType?: string;
    severity?: string;
    minConfidence?: number;
    query?: string;
}

export interface KnowledgeRepository {
    saveSource(source: KnowledgeSource): Promise<void>;
    getSource(id: string): Promise<KnowledgeSource | undefined>;
    listSources(): Promise<KnowledgeSource[]>;

    saveDocument(doc: KnowledgeDocument): Promise<void>;
    getDocument(id: string): Promise<KnowledgeDocument | undefined>;

    saveFacts(facts: KnowledgeFact[]): Promise<void>;
    getFact(id: string): Promise<KnowledgeFact | undefined>;
    findFacts(filter: FactSearchFilter): Promise<KnowledgeFact[]>;
    listFacts(): Promise<KnowledgeFact[]>;
}
