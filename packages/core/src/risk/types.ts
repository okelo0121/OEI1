import {
    RiskAssessment,
    RiskExplanation,
    RiskFactor,
    RiskFactorType,
    RiskLevel,
    RiskReasoningInput,
} from '@oei/types';

export type {
    RiskAssessment,
    RiskExplanation,
    RiskFactor,
    RiskFactorType,
    RiskLevel,
    RiskReasoningInput,
};

export const RISK_THRESHOLDS = {
    LOW_MAX: 24,
    MEDIUM_MAX: 49,
    HIGH_MAX: 74,
    CRITICAL_MIN: 75,
} as const;

export const FACTOR_WEIGHTS = {
    SEVERITY_CRITICAL: 35,
    SEVERITY_HIGH: 25,
    SEVERITY_MEDIUM: 15,
    SEVERITY_LOW: 5,
    VERSION_AFFECTED: 25,
    ACTION_IMPACT_DEPLOY: 15,
    ACTION_IMPACT_INSTALL: 10,
    ENVIRONMENT_DIRTY_REPO: 10,
    TOOL_UNAVAILABLE: 10,
    OFFICIAL_SOURCE: 5,
    HIGH_CONFIDENCE_EVIDENCE: 5,
} as const;

export interface RiskEngineOptions {
    includeAiReasoner?: boolean;
    aiProvider?: any;
}
