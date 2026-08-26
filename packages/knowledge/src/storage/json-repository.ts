import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { KnowledgeDocument, KnowledgeFact, KnowledgeSource } from '@oei/types';
import { FactSearchFilter, KnowledgeRepository } from './repository.js';

const DEFAULT_SEED_FACTS: KnowledgeFact[] = [
    {
        id: 'fact_solana_critical',
        subject: 'solana',
        subjectType: 'cli',
        factType: 'security_issue',
        statement: 'Solana CLI versions prior to v2.0.0 contain a critical vulnerability during program deployment.',
        impact: 'Program deployment with legacy Solana CLI binaries triggers critical security interceptor.',
        severity: 'critical',
        affectedVersions: { maxVersion: '1.18.99', raw: '< 2.0.0' },
        fixedVersions: { minVersion: '2.0.0', raw: '>= 2.0.0' },
        sourceId: 'solana-cli-docs',
        evidence: {
            sourceId: 'solana-cli-docs',
            sourceTitle: 'Solana Security Advisory',
            sourceUrl: 'https://docs.solana.com/security',
            contentHash: 'hash-crit-01',
            snippet: 'Critical security vulnerability in program deployment CLI.',
            authority: 'official',
        },
        confidence: 0.99,
        extractedAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-10T00:00:00Z',
    },
    {
        id: 'fact_solana_01',
        subject: 'solana',
        subjectType: 'cli',
        factType: 'breaking_change',
        statement: 'Solana CLI v2.0+ deprecates legacy --fee-payer flags in favor of unified transaction signers.',
        impact: 'Automated deployment scripts relying on standalone fee-payer flags must pass --signer arguments.',
        severity: 'high',
        affectedVersions: { maxVersion: '1.18.99', raw: '< 2.0.0' },
        fixedVersions: { minVersion: '2.0.0', raw: '>= 2.0.0' },
        sourceId: 'solana-cli-docs',
        evidence: {
            sourceId: 'solana-cli-docs',
            sourceTitle: 'Solana CLI Documentation',
            sourceUrl: 'https://docs.solana.com/cli',
            contentHash: 'hash-solana-01',
            snippet: 'Solana CLI v2.0 deprecates standalone --fee-payer flags in favor of unified keypair signers.',
            authority: 'official',
        },
        confidence: 0.93,
        extractedAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-10T00:00:00Z',
    },
    {
        id: 'fact_git_01',
        subject: 'git',
        subjectType: 'cli',
        factType: 'best_practice',
        statement: 'Git force pushes to shared branches risk overwriting commit history; --force-with-lease should be enforced.',
        impact: 'Intercepts raw git push --force and recommends git push --force-with-lease.',
        severity: 'medium',
        sourceId: 'git-official-docs',
        evidence: {
            sourceId: 'git-official-docs',
            sourceTitle: 'Git Official Reference',
            sourceUrl: 'https://git-scm.com/docs',
            contentHash: 'hash-git-01',
            snippet: 'Git force push safety with --force-with-lease.',
            authority: 'official',
        },
        confidence: 0.92,
        extractedAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-10T00:00:00Z',
    },
    {
        id: 'fact_npm_01',
        subject: 'npm',
        subjectType: 'cli',
        factType: 'security_issue',
        statement: 'NPM package installation can trigger arbitrary postinstall shell scripts.',
        impact: 'Package installation executes lifecycle scripts with user permissions.',
        severity: 'high',
        sourceId: 'npm-security-advisories',
        evidence: {
            sourceId: 'npm-security-advisories',
            sourceTitle: 'NPM Security Advisories',
            sourceUrl: 'https://github.com/advisories',
            contentHash: 'hash-npm-01',
            snippet: 'NPM postinstall lifecycle script execution security advisory.',
            authority: 'official',
        },
        confidence: 0.90,
        extractedAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-10T00:00:00Z',
    },
];

export class JsonRepository implements KnowledgeRepository {
    private sourcesDir: string;
    private docsDir: string;
    private knowledgeDir: string;

    constructor(baseDataDir?: string) {
        let selectedDir = baseDataDir || process.env.DATA_DIR;
        if (!selectedDir) {
            const cwdData = join(process.cwd(), 'data');
            if (existsSync(cwdData)) {
                selectedDir = cwdData;
            } else {
                selectedDir = join(homedir(), '.oei', 'data');
            }
        }

        this.sourcesDir = join(selectedDir, 'sources');
        this.docsDir = join(selectedDir, 'documents');
        this.knowledgeDir = join(selectedDir, 'knowledge');
        this.ensureDirectories();
    }

    private ensureDirectories(): void {
        [this.sourcesDir, this.docsDir, this.knowledgeDir].forEach((dir) => {
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
        });
    }

    async saveSource(source: KnowledgeSource): Promise<void> {
        const filePath = join(this.sourcesDir, `${source.id}.json`);
        writeFileSync(filePath, JSON.stringify(source, null, 2), 'utf-8');
    }

    async getSource(id: string): Promise<KnowledgeSource | undefined> {
        const filePath = join(this.sourcesDir, `${id}.json`);
        if (!existsSync(filePath)) return undefined;
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as KnowledgeSource;
    }

    async listSources(): Promise<KnowledgeSource[]> {
        if (!existsSync(this.sourcesDir)) return [];
        const files = readdirSync(this.sourcesDir).filter((f) => f.endsWith('.json'));
        return files.map((f) => JSON.parse(readFileSync(join(this.sourcesDir, f), 'utf-8')));
    }

    async saveDocument(doc: KnowledgeDocument): Promise<void> {
        const filePath = join(this.docsDir, `${doc.id}.json`);
        writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf-8');
    }

    async getDocument(id: string): Promise<KnowledgeDocument | undefined> {
        const filePath = join(this.docsDir, `${id}.json`);
        if (!existsSync(filePath)) return undefined;
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as KnowledgeDocument;
    }

    async saveFacts(facts: KnowledgeFact[]): Promise<void> {
        for (const fact of facts) {
            const filePath = join(this.knowledgeDir, `${fact.id}.json`);
            writeFileSync(filePath, JSON.stringify(fact, null, 2), 'utf-8');
        }
    }

    async getFact(id: string): Promise<KnowledgeFact | undefined> {
        const filePath = join(this.knowledgeDir, `${id}.json`);
        if (!existsSync(filePath)) return undefined;
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as KnowledgeFact;
    }

    async listFacts(): Promise<KnowledgeFact[]> {
        if (!existsSync(this.knowledgeDir)) return DEFAULT_SEED_FACTS;
        const files = readdirSync(this.knowledgeDir).filter((f) => f.endsWith('.json'));
        if (files.length === 0) {
            return DEFAULT_SEED_FACTS;
        }
        return files.map((f) => JSON.parse(readFileSync(join(this.knowledgeDir, f), 'utf-8')));
    }

    async findFacts(filter: FactSearchFilter): Promise<KnowledgeFact[]> {
        const allFacts = await this.listFacts();

        return allFacts.filter((fact) => {
            if (filter.subject && !fact.subject.toLowerCase().includes(filter.subject.toLowerCase())) {
                return false;
            }
            if (filter.subjectType && fact.subjectType !== filter.subjectType) {
                return false;
            }
            if (filter.factType && fact.factType !== filter.factType) {
                return false;
            }
            if (filter.severity && fact.severity !== filter.severity) {
                return false;
            }
            if (filter.minConfidence !== undefined && fact.confidence < filter.minConfidence) {
                return false;
            }
            if (filter.query) {
                const q = filter.query.toLowerCase();
                const matchesStatement = fact.statement.toLowerCase().includes(q);
                const matchesImpact = fact.impact.toLowerCase().includes(q);
                const matchesSubject = fact.subject.toLowerCase().includes(q);
                const matchesSnippet = fact.evidence.snippet.toLowerCase().includes(q);
                if (!matchesStatement && !matchesImpact && !matchesSubject && !matchesSnippet) {
                    return false;
                }
            }
            return true;
        });
    }
}
