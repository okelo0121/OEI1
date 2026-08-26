import { KnowledgeDocument } from '@oei/types';

export class DocumentNormalizer {
    normalize(doc: KnowledgeDocument): KnowledgeDocument {
        let text = doc.content || '';

        // Preserve headings by transforming HTML tags <h1>-<h6> or markdown # to clean text headings
        text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n=== $1 ===\n\n');

        // Preserve code blocks in HTML <pre><code> or ``` to clean code blocks
        text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
        text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, ' `$1` ');

        // Preserve links in HTML <a href="...">text</a>
        text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)');

        // Strip remaining HTML tags
        text = text.replace(/<[^>]+>/g, ' ');

        // Unescape standard HTML entities
        text = text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        // Normalize multiple spaces and newlines while preserving block structures
        text = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
            .join('\n');

        return {
            ...doc,
            content: text,
            metadata: {
                ...(doc.metadata || {}),
                normalizedAt: new Date().toISOString(),
                originalLength: (doc.content || '').length,
                normalizedLength: text.length,
            },
        };
    }
}
