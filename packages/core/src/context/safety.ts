import path from 'node:path';

export class SafetyGuard {
    private static PROTECTED_PATTERNS: RegExp[] = [
        /\.env(\..+)?$/i,
        /id_rsa$/i,
        /id_ed25519$/i,
        /\.pem$/i,
        /\.key$/i,
        /credentials\.json$/i,
        /secrets?\..+$/i,
        /wallet.*\.json$/i,
        /^id\.json$/i,
        /auth\.json$/i,
        /\.npmrc$/i,
        /\.gitcredentials$/i,
    ];

    private static SENSITIVE_VAR_KEYWORDS = [
        'SECRET',
        'KEY',
        'PASSWORD',
        'TOKEN',
        'CREDENTIAL',
        'AUTH',
        'SEED',
        'PRIVATE',
        'PASSPHRASE',
    ];

    /**
     * Check if a given file path is protected and must NOT be read or exposed.
     */
    static isPathProtected(filePath: string): boolean {
        if (!filePath) return true;
        const normalized = filePath.replace(/\\/g, '/');
        const basename = path.basename(normalized);

        return this.PROTECTED_PATTERNS.some(pattern => pattern.test(basename) || pattern.test(normalized));
    }

    /**
     * Sanitize environment variable names to indicate presence while guarding sensitive names.
     */
    static isSensitiveEnvVarName(varName: string): boolean {
        const upper = varName.toUpperCase();
        return this.SENSITIVE_VAR_KEYWORDS.some(keyword => upper.includes(keyword));
    }
}
