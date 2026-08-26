export type RecommendationType = 'ALLOW' | 'WARN' | 'SUGGESTION' | 'BLOCK';

export type RemediationStepSafety = 'SAFE' | 'POTENTIALLY_STATE_CHANGING';

export interface RemediationStep {
    description: string;
    command?: string;
    safety: RemediationStepSafety;
    evidenceReferences?: string[];
}

export interface RecommendationExplanation {
    summary: string;
    impact: string;
    remediationExplanation: string;
    uncertainties: string[];
    evidenceReferences: string[];
}

export interface Recommendation {
    action: RecommendationType;
    title: string;
    summary: string;
    reasons: string[];
    remediation: RemediationStep[];
    evidence: Array<{
        sourceId: string;
        sourceUrl?: string;
        authority?: string;
        confidence: number;
    }>;
    confidence: number;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    explanation?: RecommendationExplanation;
}
