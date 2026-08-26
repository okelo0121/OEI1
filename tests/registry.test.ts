import { describe, expect, it } from 'vitest';
import { SourceRegistry } from '../packages/knowledge/src/sources/registry.js';
import { KnowledgeSource } from '../packages/types/src/source.js';

describe('SourceRegistry', () => {
    it('seeds default authoritative developer sources on initialization', () => {
        const registry = new SourceRegistry();
        const sources = registry.listSources();
        expect(sources.length).toBeGreaterThanOrEqual(4);

        const solanaSource = registry.getSource('solana-cli-docs');
        expect(solanaSource).toBeDefined();
        expect(solanaSource?.authority).toBe('official');
        expect(solanaSource?.publisher).toBe('Solana Foundation');
    });

    it('allows registering, listing, and disabling custom sources', () => {
        const registry = new SourceRegistry();
        const custom: KnowledgeSource = {
            id: 'custom-tool-docs',
            url: 'https://example.com/docs',
            title: 'Custom Tool Documentation',
            type: 'official_docs',
            authority: 'trusted',
            publisher: 'Custom Team',
            enabled: true,
        };

        registry.registerSource(custom);
        expect(registry.getSource('custom-tool-docs')).toBeDefined();

        registry.disableSource('custom-tool-docs');
        const active = registry.listSources(true);
        expect(active.find((s) => s.id === 'custom-tool-docs')).toBeUndefined();
    });
});
