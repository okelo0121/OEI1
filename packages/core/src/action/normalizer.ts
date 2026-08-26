import { CommandToken, NormalizedCommand } from './types.js';

export class ActionNormalizer {
    /**
     * Tokenize and normalize a raw shell command string into a structured NormalizedCommand.
     */
    static normalize(rawCommand: string): NormalizedCommand {
        const trimmed = (rawCommand || '').trim();

        if (!trimmed) {
            return {
                rawCommand: rawCommand || '',
                executable: '',
                args: [],
                tokens: [],
                flags: [],
                options: {},
                positionalArgs: [],
                isMalformed: true,
                malformedReason: 'Empty or whitespace-only command string',
            };
        }

        const { tokens, isMalformed, malformedReason } = this.tokenize(trimmed);

        if (tokens.length === 0) {
            return {
                rawCommand,
                executable: '',
                args: [],
                tokens: [],
                flags: [],
                options: {},
                positionalArgs: [],
                isMalformed: true,
                malformedReason: malformedReason || 'No valid command executable found',
            };
        }

        const executable = tokens[0].value;
        const rawArgs = tokens.slice(1);
        const args = rawArgs.map(t => t.value);

        const flags: string[] = [];
        const options: Record<string, string | boolean> = {};
        const positionalArgs: string[] = [];

        for (let i = 0; i < rawArgs.length; i++) {
            const token = rawArgs[i];
            const val = token.value;

            if (!token.isQuoted && val.startsWith('-') && val.length > 1) {
                // Flag or option
                if (val.includes('=')) {
                    const eqIdx = val.indexOf('=');
                    const flagName = val.slice(0, eqIdx);
                    const flagVal = val.slice(eqIdx + 1);
                    flags.push(flagName);
                    options[flagName] = flagVal;
                } else {
                    flags.push(val);
                    // Check if next token is option value (not starting with - and not quoted flag)
                    const nextToken = rawArgs[i + 1];
                    if (
                        nextToken &&
                        (!nextToken.value.startsWith('-') || nextToken.isQuoted)
                    ) {
                        options[val] = nextToken.value;
                        // Peek to check if next token is positional or flag argument;
                        // Some flags like `-m "msg"` consume next token as value.
                        // We will record option value, but also keep token in positional if appropriate or advance pointer if consumed.
                    } else {
                        options[val] = true;
                    }
                }
            } else {
                positionalArgs.push(val);
            }
        }

        return {
            rawCommand,
            executable,
            args,
            tokens,
            flags,
            options,
            positionalArgs,
            isMalformed,
            malformedReason,
        };
    }

    /**
     * Lexer supporting double quotes, single quotes, and escape characters.
     */
    private static tokenize(input: string): {
        tokens: CommandToken[];
        isMalformed: boolean;
        malformedReason?: string;
    } {
        const tokens: CommandToken[] = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';
        let escaped = false;
        let isMalformed = false;
        let malformedReason: string | undefined;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (inQuote) {
                if (char === quoteChar) {
                    inQuote = false;
                    tokens.push({
                        value: current,
                        raw: `${quoteChar}${current}${quoteChar}`,
                        isQuoted: true,
                        quoteChar,
                    });
                    current = '';
                    quoteChar = '';
                } else {
                    current += char;
                }
                continue;
            }

            if (char === '"' || char === "'") {
                inQuote = true;
                quoteChar = char;
                continue;
            }

            if (/\s/.test(char)) {
                if (current.length > 0) {
                    tokens.push({
                        value: current,
                        raw: current,
                        isQuoted: false,
                    });
                    current = '';
                }
                continue;
            }

            current += char;
        }

        if (inQuote) {
            isMalformed = true;
            malformedReason = `Unclosed quote (${quoteChar}) detected in command string`;
            if (current.length > 0) {
                tokens.push({
                    value: current,
                    raw: current,
                    isQuoted: true,
                    quoteChar,
                });
            }
        } else if (current.length > 0) {
            tokens.push({
                value: current,
                raw: current,
                isQuoted: false,
            });
        }

        return { tokens, isMalformed, malformedReason };
    }
}
