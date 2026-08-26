import { execSync } from 'node:child_process';
import { RuntimeContext, ToolRuntimeInfo } from './types.js';

export class RuntimeCollector {
    static collect(actionTool?: string): RuntimeContext {
        const tool = (actionTool || '').toLowerCase();

        const runtime: RuntimeContext = {};

        // Always check node & npm baseline
        if (tool === 'npm' || tool === 'node' || !actionTool || tool === 'unknown') {
            runtime.node = this.checkTool('node --version');
            runtime.npm = this.checkTool('npm --version');
        }

        if (tool === 'cargo' || tool === 'rust' || tool === 'solana' || !actionTool || tool === 'unknown') {
            runtime.rust = this.checkTool('rustc --version');
            runtime.cargo = this.checkTool('cargo --version');
        }

        if (tool === 'solana' || !actionTool || tool === 'unknown') {
            runtime.solana = this.checkTool('solana --version');
        }

        // Fill missing requested fields cleanly
        if (!runtime.node) runtime.node = this.checkTool('node --version');
        if (!runtime.npm) runtime.npm = this.checkTool('npm --version');

        return runtime;
    }

    private static checkTool(cmd: string): ToolRuntimeInfo {
        try {
            const output = execSync(cmd, {
                timeout: 2000,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }).trim();

            if (output) {
                // Extract version string (first token or version match)
                const match = output.match(/(\d+\.\d+\.\d+[^\s]*)/);
                const version = match ? match[1] : output;
                return { available: true, version };
            }
            return { available: false };
        } catch {
            return { available: false };
        }
    }
}
