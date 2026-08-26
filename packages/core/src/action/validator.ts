import { Action, ValidationResult } from './types.js';

export class ActionValidator {
    /**
     * Validate an Action object against baseline integrity rules and confidence bounds.
     */
    static validate(action: Action): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!action) {
            return {
                valid: false,
                errors: ['Action object is null or undefined'],
                warnings: [],
            };
        }

        if (typeof action.rawCommand !== 'string' || action.rawCommand.trim() === '') {
            errors.push('rawCommand must be a non-empty string');
        }

        if (!action.tool) {
            errors.push('Action tool field is missing');
        }

        if (!action.operation) {
            errors.push('Action operation field is missing');
        }

        if (!action.category) {
            errors.push('Action category field is missing');
        }

        if (action.tool === 'unknown' || action.operation === 'unknown') {
            warnings.push('Action tool or operation could not be deterministically classified (unknown)');
        }

        if (action.confidence < 0.0 || action.confidence > 1.0) {
            errors.push(`Action confidence out of bounds [0.0, 1.0]: ${action.confidence}`);
        }

        if (action.metadata?.isMalformed) {
            warnings.push(`Action input was malformed: ${action.metadata.malformedReason || 'Syntax error'}`);
        }

        const valid = errors.length === 0;

        return {
            valid,
            errors,
            warnings,
        };
    }
}
