import { describe, expect, it } from 'vitest';
import { DocumentNormalizer } from '../packages/knowledge/src/documents/normalizer.js';
import { KnowledgeDocument } from '../packages/types/src/knowledge.js';

describe('DocumentNormalizer', () => {
    it('normalizes HTML, strips noise, and preserves technical code/command blocks', () => {
        const normalizer = new DocumentNormalizer();
        const rawDoc: KnowledgeDocument = {
            id: 'doc_raw_1',
            sourceId: 'src_1',
            url: 'https://docs.solana.com',
            title: 'Solana CLI Release',
            content: `
        <h1>Solana CLI Release Notes</h1>
        <p>This is a <strong>major update</strong> to the CLI.</p>
        <pre><code>solana program deploy --signer keypair.json</code></pre>
        <a href="https://solana.com/docs">Solana Docs</a>
      `,
            contentHash: 'hash123',
            fetchedAt: new Date().toISOString(),
        };

        const normalized = normalizer.normalize(rawDoc);

        expect(normalized.content).toContain('=== Solana CLI Release Notes ===');
        expect(normalized.content).toContain('solana program deploy --signer keypair.json');
        expect(normalized.content).toContain('Solana Docs (https://solana.com/docs)');
        expect(normalized.content).not.toContain('<h1>');
        expect(normalized.content).not.toContain('<pre>');
    });
});
