import { ActionParser } from './parser.js';
import { ActionNormalizer } from './normalizer.js';
import { ActionValidator } from './validator.js';
import { Action } from './types.js';

export * from './types.js';
export { ActionNormalizer } from './normalizer.js';
export { ActionParser } from './parser.js';
export { ActionValidator } from './validator.js';

export function parseAction(rawCommand: string): Action {
    return ActionParser.parse(rawCommand);
}

export function normalizeCommand(rawCommand: string) {
    return ActionNormalizer.normalize(rawCommand);
}

export function validateAction(action: Action) {
    return ActionValidator.validate(action);
}
