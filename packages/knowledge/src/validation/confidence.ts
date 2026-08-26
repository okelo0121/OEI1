import { SourceAuthority } from '@oei/types';

export function getAuthorityBaselineConfidence(authority: SourceAuthority): number {
    switch (authority) {
        case 'official':
            return 0.90;
        case 'trusted':
            return 0.75;
        case 'community':
            return 0.60;
        case 'unknown':
        default:
            return 0.40;
    }
}

export function calculateFactConfidence(
    authority: SourceAuthority,
    aiConfidence: number = 0.8,
    hasSnippetEvidence: boolean = true
): number {
    const baseline = getAuthorityBaselineConfidence(authority);

    // Authority provides 70% weight, AI extraction score provides 30% weight
    let confidence = baseline * 0.7 + Math.min(1, Math.max(0, aiConfidence)) * 0.3;

    // Penalty if no supporting snippet evidence was retained
    if (!hasSnippetEvidence) {
        confidence *= 0.7;
    }

    // Round to 2 decimal places deterministically
    return Math.round(confidence * 100) / 100;
}
