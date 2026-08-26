import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface OEIConfig {
    AI_PROVIDER: string;
    AI_API_KEY?: string;
    KNOWLEDGE_DIR?: string;
    LOG_LEVEL?: string;
    AUTO_CONFIRM?: boolean;
    [key: string]: any;
}

const DEFAULT_CONFIG: OEIConfig = {
    AI_PROVIDER: 'mock',
    AI_API_KEY: '',
    KNOWLEDGE_DIR: '',
    LOG_LEVEL: 'info',
    AUTO_CONFIRM: false,
};

const VALID_AI_PROVIDERS = ['mock', 'generic', 'openai', 'anthropic', 'local'];
const MASKED_PATTERNS = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'AUTH', 'PRIVATE'];

export class ConfigService {
    private configPath: string;
    private configData: OEIConfig;

    constructor(customPath?: string) {
        const oeiDir = join(homedir(), '.oei');
        this.configPath = customPath || join(oeiDir, 'config.json');
        this.configData = { ...DEFAULT_CONFIG };
        this.loadConfig();
    }

    private loadConfig(): void {
        try {
            if (existsSync(this.configPath)) {
                const raw = readFileSync(this.configPath, 'utf-8');
                const parsed = JSON.parse(raw);
                this.configData = { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch {
            this.configData = { ...DEFAULT_CONFIG };
        }
    }

    private saveConfig(): void {
        try {
            const dir = join(this.configPath, '..');
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            writeFileSync(this.configPath, JSON.stringify(this.configData, null, 2), 'utf-8');
        } catch (err) {
            console.error(`[ConfigService] Failed to save config to ${this.configPath}:`, err);
        }
    }

    public get(key: string): any {
        return this.configData[key] !== undefined ? this.configData[key] : DEFAULT_CONFIG[key];
    }

    public set(key: string, value: any): void {
        if (key === 'AI_PROVIDER') {
            const valStr = String(value).toLowerCase();
            if (!VALID_AI_PROVIDERS.includes(valStr)) {
                throw new Error(`Invalid configuration value for AI_PROVIDER.\nSupported values: ${VALID_AI_PROVIDERS.join(', ')}.`);
            }
            value = valStr;
        }

        // Parse boolean / number values if string passed
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') value = Number(value);

        this.configData[key] = value;
        this.saveConfig();
    }

    public list(): OEIConfig {
        return { ...this.configData };
    }

    public isSensitiveKey(key: string): boolean {
        const upper = key.toUpperCase();
        return MASKED_PATTERNS.some((pattern) => upper.includes(pattern));
    }

    public maskValue(key: string, value: any): string {
        if (value === undefined || value === null || value === '') {
            return '(not set)';
        }
        if (this.isSensitiveKey(key)) {
            const strVal = String(value);
            if (strVal.length <= 4) return '****';
            return `${strVal.substring(0, 2)}****${strVal.substring(strVal.length - 2)}`;
        }
        return String(value);
    }

    public getMaskedList(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(this.configData)) {
            result[key] = this.maskValue(key, value);
        }
        return result;
    }
}
