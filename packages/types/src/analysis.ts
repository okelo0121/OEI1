import { KnowledgeFact } from './knowledge.js';
import { CommandAction } from './action.js';

export interface AnalysisRisk {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
    title: string;
    description: string;
}

export interface AnalysisFinding {
    category: string;
    value: string;
    status: string;
    factId?: string;
}

export interface AnalysisRecommendation {
    type: 'ALLOW' | 'WARN' | 'SUGGESTION' | 'BLOCK';
    message: string;
}

export interface AnalysisReport {
    id: string;
    action: CommandAction;
    risk: AnalysisRisk;
    findings: AnalysisFinding[];
    recommendations: AnalysisRecommendation[];
    matchedFacts: KnowledgeFact[];
    analyzedAt: string;
}
