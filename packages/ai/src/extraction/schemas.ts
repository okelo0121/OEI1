import { z } from 'zod';

export const VersionRangeSchema = z.object({
    minVersion: z.string().optional(),
    maxVersion: z.string().optional(),
    exactVersion: z.string().optional(),
    raw: z.string().optional(),
});

export const RawFactSchema = z.object({
    subject: z.string().min(1),
    subjectType: z.enum(['cli', 'sdk', 'package', 'protocol', 'framework', 'tool']),
    factType: z.enum([
        'behavior_change',
        'breaking_change',
        'security_issue',
        'compatibility',
        'deprecation',
        'bug',
        'feature',
        'best_practice',
        'release',
        'configuration_change',
    ]),
    statement: z.string().min(5),
    impact: z.string().min(3),
    severity: z.enum(['info', 'low', 'medium', 'high', 'critical', 'unknown']),
    affectedVersions: VersionRangeSchema.optional(),
    fixedVersions: VersionRangeSchema.optional(),
    snippet: z.string().min(5),
    aiConfidence: z.number().min(0).max(1).default(0.8),
});

export const ExtractionResultSchema = z.object({
    facts: z.array(RawFactSchema),
    notes: z.string().optional(),
});

export type RawFact = z.infer<typeof RawFactSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
