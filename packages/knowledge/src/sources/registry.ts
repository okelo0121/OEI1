import { KnowledgeSource } from '@oei/types';

export class SourceRegistry {
    private sources: Map<string, KnowledgeSource> = new Map();

    constructor(initialSources: KnowledgeSource[] = []) {
        if (initialSources.length > 0) {
            initialSources.forEach((source) => this.registerSource(source));
        } else {
            this.seedDefaultSources();
        }
    }

    registerSource(source: KnowledgeSource): KnowledgeSource {
        if (!source.id) {
            source.id = `src_${Math.random().toString(36).substring(2, 9)}`;
        }
        this.sources.set(source.id, { ...source });
        return this.sources.get(source.id)!;
    }

    getSource(id: string): KnowledgeSource | undefined {
        return this.sources.get(id);
    }

    listSources(filterEnabledOnly: boolean = false): KnowledgeSource[] {
        const all = Array.from(this.sources.values());
        if (filterEnabledOnly) {
            return all.filter((s) => s.enabled);
        }
        return all;
    }

    updateSource(id: string, updates: Partial<KnowledgeSource>): KnowledgeSource | undefined {
        const existing = this.sources.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...updates, id };
        this.sources.set(id, updated);
        return updated;
    }

    disableSource(id: string): boolean {
        const source = this.sources.get(id);
        if (!source) return false;
        source.enabled = false;
        this.sources.set(id, source);
        return true;
    }

    removeSource(id: string): boolean {
        return this.sources.delete(id);
    }

    private seedDefaultSources(): void {
        const defaults: KnowledgeSource[] = [
            {
                id: 'solana-cli-docs',
                url: 'https://docs.solana.com/cli',
                title: 'Solana CLI Official Documentation',
                type: 'official_docs',
                authority: 'official',
                publisher: 'Solana Foundation',
                enabled: true,
                metadata: { tool: 'solana', category: 'cli' },
            },
            {
                id: 'solana-web3js-releases',
                url: 'https://github.com/solana-labs/solana-web3.js/releases',
                title: 'Solana Web3.js SDK Releases',
                type: 'release_notes',
                authority: 'official',
                publisher: 'Solana Labs',
                enabled: true,
                metadata: { tool: 'solana-web3.js', category: 'sdk' },
            },
            {
                id: 'git-official-docs',
                url: 'https://git-scm.com/docs',
                title: 'Official Git Reference Documentation',
                type: 'official_docs',
                authority: 'official',
                publisher: 'Git Project',
                enabled: true,
                metadata: { tool: 'git', category: 'cli' },
            },
            {
                id: 'npm-security-advisories',
                url: 'https://github.com/advisories',
                title: 'NPM & Node.js Security Advisories',
                type: 'security_advisory',
                authority: 'official',
                publisher: 'GitHub Security Advisory Database',
                enabled: true,
                metadata: { tool: 'npm', category: 'package' },
            },
        ];

        defaults.forEach((s) => this.registerSource(s));
    }
}
