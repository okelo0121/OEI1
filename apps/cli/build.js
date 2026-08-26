import { buildSync } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const outfile = join(process.cwd(), 'dist', 'index.js');
const monorepoRoot = resolve(process.cwd(), '../..');

buildSync({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile,
    format: 'cjs',
    alias: {
        '@oei/types': resolve(monorepoRoot, 'packages/types/src/index.ts'),
        '@oei/ai': resolve(monorepoRoot, 'packages/ai/src/index.ts'),
        '@oei/knowledge': resolve(monorepoRoot, 'packages/knowledge/src/index.ts'),
        '@oei/core': resolve(monorepoRoot, 'packages/core/src/index.ts'),
        '@oei/analyzers': resolve(monorepoRoot, 'packages/analyzers/src/index.ts'),
        'commander': resolve(monorepoRoot, 'node_modules/.pnpm/commander@13.1.0/node_modules/commander/index.js'),
    },
});

const content = readFileSync(outfile, 'utf-8');
if (!content.startsWith('#!/usr/bin/env node')) {
    writeFileSync(outfile, '#!/usr/bin/env node\n' + content, 'utf-8');
}
console.log('[OEI Build] Successfully bundled @oei/cli into self-contained dist/index.js');
