import { existsSync } from 'fs';
import { KnowledgeDocument } from '@oei/types';
import { ExtractionResult, ExtractionResultSchema, RawFact } from '../extraction/schemas.js';
import { SYSTEM_EXTRACTION_PROMPT } from '../extraction/prompts.js';

export interface AIProvider {
    name: string;
    extractKnowledge(document: KnowledgeDocument): Promise<ExtractionResult>;
}

export class MockAIProvider implements AIProvider {
    name = 'MockAIProvider';

    async extractKnowledge(doc: KnowledgeDocument): Promise<ExtractionResult> {
        const text = doc.content.toLowerCase();
        const facts: RawFact[] = [];

        // Deterministic Extraction for Solana Domain Knowledge
        if (text.includes('solana')) {
            if (text.includes('v2.0') || text.includes('v2.1') || text.includes('breaking') || text.includes('deprecated') || text.includes('agave')) {
                facts.push({
                    subject: 'solana',
                    subjectType: 'cli',
                    factType: 'breaking_change',
                    statement: 'Solana CLI v2.0+ deprecates legacy --fee-payer flags in favor of unified transaction signers.',
                    impact: 'Automated deployment scripts relying on standalone fee-payer flags must pass --signer arguments.',
                    severity: 'high',
                    affectedVersions: { maxVersion: '1.18.99', raw: '< 2.0.0' },
                    fixedVersions: { minVersion: '2.0.0', raw: '>= 2.0.0' },
                    snippet: doc.content.slice(0, 150) || 'Solana CLI v2.0 deprecations',
                    aiConfidence: 0.9,
                });
            }

            if (text.includes('web3.js') || text.includes('@solana/web3.js')) {
                facts.push({
                    subject: 'solana-web3.js',
                    subjectType: 'sdk',
                    factType: 'compatibility',
                    statement: '@solana/web3.js v2.0 introduces async transaction building and modular pipeline builders.',
                    impact: 'Applications upgrading to web3.js v2 must replace legacy Transaction class calls with buildTransaction().',
                    severity: 'medium',
                    affectedVersions: { maxVersion: '1.95.0', raw: '< 2.0.0' },
                    fixedVersions: { minVersion: '2.0.0', raw: '>= 2.0.0' },
                    snippet: 'web3.js v2 async transaction building',
                    aiConfidence: 0.85,
                });
            }
        }

        // Deterministic Extraction for Git Domain Knowledge
        if (text.includes('git')) {
            if (text.includes('force') || text.includes('push') || text.includes('lease') || text.includes('default branch')) {
                facts.push({
                    subject: 'git',
                    subjectType: 'cli',
                    factType: 'best_practice',
                    statement: 'Git force pushes to shared branches risk overwriting commit history; --force-with-lease should be enforced.',
                    impact: 'Intercepts raw git push --force and recommends git push --force-with-lease.',
                    severity: 'medium',
                    affectedVersions: { raw: 'all versions' },
                    snippet: 'git push --force safety rules',
                    aiConfidence: 0.95,
                });
            }
        }

        // Deterministic Extraction for npm Domain Knowledge
        if (text.includes('npm') || text.includes('package')) {
            if (text.includes('scripts') || text.includes('lifecycle') || text.includes('audit') || text.includes('vulnerability')) {
                facts.push({
                    subject: 'npm',
                    subjectType: 'package',
                    factType: 'security_issue',
                    statement: 'NPM package installation can trigger arbitrary postinstall shell scripts.',
                    impact: 'Untrusted dependencies may execute malformed postinstall hooks during npm install.',
                    severity: 'high',
                    affectedVersions: { raw: 'all versions' },
                    snippet: 'npm postinstall execution warning',
                    aiConfidence: 0.9,
                });
            }
        }

        // Fallback default fact if text did not match standard mock keywords
        if (facts.length === 0) {
            facts.push({
                subject: doc.title ? doc.title.toLowerCase().split(' ')[0] : 'tool',
                subjectType: 'tool',
                factType: 'release',
                statement: `Release update recorded for document: ${doc.title}`,
                impact: 'Information update regarding developer tool capabilities.',
                severity: 'info',
                snippet: doc.content.slice(0, 100) || doc.title || 'Technical update',
                aiConfidence: 0.75,
            });
        }

        return {
            facts,
            notes: 'Extracted via MockAIProvider',
        };
    }
}

export class LocalAIProvider implements AIProvider {
    name = 'LocalAIProvider';

    constructor(
        private endpoint: string = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434/v1/chat/completions',
        private model: string = process.env.LOCAL_AI_MODEL || 'llama3'
    ) { }

    async extractKnowledge(doc: KnowledgeDocument): Promise<ExtractionResult> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: SYSTEM_EXTRACTION_PROMPT },
                        { role: 'user', content: `Document Title: ${doc.title}\nURL: ${doc.url}\nContent:\n${doc.content}` },
                    ],
                    temperature: 0.1,
                }),
            });

            if (!response.ok) {
                console.warn(`[LocalAIProvider] Local endpoint ${this.endpoint} returned ${response.status}. Falling back to MockAIProvider.`);
                return new MockAIProvider().extractKnowledge(doc);
            }

            const data: any = await response.json();
            const rawText = data?.choices?.[0]?.message?.content || '';

            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
            const cleanJson = jsonMatch[1] ? jsonMatch[1].trim() : rawText.trim();

            const parsed = JSON.parse(cleanJson);
            return ExtractionResultSchema.parse(parsed);
        } catch (error) {
            console.warn(`[LocalAIProvider] Could not connect to local AI endpoint (${this.endpoint}). Falling back to MockAIProvider.`);
            return new MockAIProvider().extractKnowledge(doc);
        }
    }
}

export class GenericAIProvider implements AIProvider {
    name = 'GenericAIProvider';

    constructor(
        private apiKey: string = process.env.AI_API_KEY || '',
        private model: string = process.env.AI_MODEL || 'gemini-1.5-flash',
        private providerType: string = process.env.AI_PROVIDER || 'gemini'
    ) { }

    async extractKnowledge(doc: KnowledgeDocument): Promise<ExtractionResult> {
        if (!this.apiKey || this.apiKey === 'your_api_key_here') {
            return new MockAIProvider().extractKnowledge(doc);
        }

        try {
            const activeModel = this.providerType === 'gemini' && (this.model === 'gemini-2.5-flash' || !this.model)
                ? 'gemini-1.5-flash'
                : this.model;

            const endpoint = this.providerType === 'gemini'
                ? `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${this.apiKey}`
                : 'https://api.openai.com/v1/chat/completions';

            const payload = this.providerType === 'gemini'
                ? {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: SYSTEM_EXTRACTION_PROMPT },
                                { text: `Document Title: ${doc.title}\nURL: ${doc.url}\nContent:\n${doc.content}` },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                }
                : {
                    model: activeModel,
                    messages: [
                        { role: 'system', content: SYSTEM_EXTRACTION_PROMPT },
                        { role: 'user', content: `Document Title: ${doc.title}\nURL: ${doc.url}\nContent:\n${doc.content}` },
                    ],
                    response_format: { type: 'json_object' },
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.providerType !== 'gemini' ? { Authorization: `Bearer ${this.apiKey}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.warn(`[GenericAIProvider] API endpoint returned ${response.status}. Falling back to MockAIProvider.`);
                return new MockAIProvider().extractKnowledge(doc);
            }

            const data: any = await response.json();
            let rawText = '';

            if (this.providerType === 'gemini') {
                rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
                rawText = data?.choices?.[0]?.message?.content || '';
            }

            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
            const cleanJson = jsonMatch[1] ? jsonMatch[1].trim() : rawText.trim();

            const parsed = JSON.parse(cleanJson);
            return ExtractionResultSchema.parse(parsed);
        } catch (error) {
            console.warn('[GenericAIProvider] API call failed. Falling back to MockAIProvider:', error);
            return new MockAIProvider().extractKnowledge(doc);
        }
    }
}

export function createAIProvider(): AIProvider {
    if (typeof process !== 'undefined' && (process as any).loadEnvFile) {
        if (existsSync('.env')) {
            try {
                (process as any).loadEnvFile('.env');
            } catch { }
        } else if (existsSync('.env.example')) {
            try {
                (process as any).loadEnvFile('.env.example');
            } catch { }
        }
    }

    const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

    if (provider === 'local') {
        return new LocalAIProvider();
    }

    if (provider === 'mock' || !process.env.AI_API_KEY) {
        return new MockAIProvider();
    }

    return new GenericAIProvider();
}
