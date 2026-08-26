import { Action } from './action.js';
import { ContextSnapshot } from './context.js';
import { KnowledgeMatch } from './retrieval.js';
import { Severity } from './knowledge.js';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskFactorType =
    | 'affected-version'
    | 'security-advisory'
    | 'breaking-change'
    | 'dependency-risk'
    | 'action-impact'
    | 'environment-mismatch'
    | 'tool-unavailable'
    | 'evidence-confidence'
    | 'source-authority';

export interface RiskFactor {
    type: RiskFactorType;
    severity: Severity;
    contribution: number;
    description: string;
    sourceId?: string;
    sourceUrl?: string;
    authority?: 'official' | 'trusted' | 'community' | 'unknown';
    confidence: number;
}

export interface RiskExplanation {
    summary: string;
    impact: string;
    reasoning: string;
    evidenceReferences: string[];
    uncertainties: string[];
}

export interface RiskReasoningInput {
    action: Action;
    context: ContextSnapshot;
    riskAssessment: Omit<RiskAssessment, 'explanation'>;
    knowledgeMatches: KnowledgeMatch[];
}

export interface RiskAssessment {
    id: string;
    score: number;
    level: RiskLevel;
    factors: RiskFactor[];
    confidence: number;
    methodology: string;
    timestamp: string;
    explanation?: RiskExplanation;
    metadata?: Record<string, any>;
}
