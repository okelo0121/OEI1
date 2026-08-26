import { ExecutionCommand } from '@oei/types';

export class SafeCommandParser {
    /**
     * Safely parse raw shell command string into structured ExecutionCommand object.
     * Intercepts unsupported shell operators (&&, ||, ;, >, >>, |, <, $(), ``, newlines).
     */
    static parse(rawCommand: string, targetCwd?: string): ExecutionCommand {
        const trimmed = (rawCommand || '').trim();
        const cwd = targetCwd || process.cwd();

        // 1. Inspect for unsupported/unsafe shell operators
        const unsafeOperatorRegex = /(&&|\|\||;|>>|>|\||<|\$\(|\`|\n|\r)/;
        const match = trimmed.match(unsafeOperatorRegex);

        if (match) {
            return {
                rawCommand: trimmed,
                executable: '',
                args: [],
                cwd,
                hasShellOperators: true,
                unsupportedShellOperator: match[0],
            };
        }

        // 2. Tokenize command arguments safely handling double and single quotes
        const tokens: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < trimmed.length; i++) {
            const char = trimmed[i];

            if ((char === '"' || char === "'")) {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                } else {
                    current += char;
                }
            } else if (char === ' ' && !inQuotes) {
                if (current.length > 0) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current.length > 0) {
            tokens.push(current);
        }

        const executable = tokens.length > 0 ? tokens[0] : '';
        const args = tokens.length > 1 ? tokens.slice(1) : [];

        return {
            rawCommand: trimmed,
            executable,
            args,
            cwd,
            hasShellOperators: false,
        };
    }
}
