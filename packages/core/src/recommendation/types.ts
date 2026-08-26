import {
    Recommendation,
    RecommendationExplanation,
    RecommendationType,
    RemediationStep,
    RemediationStepSafety,
} from '@oei/types';
import { AIProvider } from '@oei/ai';

export type {
    Recommendation,
    RecommendationExplanation,
    RecommendationType,
    RemediationStep,
    RemediationStepSafety,
};

export interface RecommendationEngineOptions {
    includeAiExplainer?: boolean;
    aiProvider?: AIProvider;
}
