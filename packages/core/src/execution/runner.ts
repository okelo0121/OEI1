import { spawn } from 'child_process';
import { ExecutionCommand } from '@oei/types';

export class SafeCommandRunner {
    /**
     * Safely execute an approved process via child_process.spawn.
     * Forwards stdout/stderr streams and preserves process exit code.
     */
    static async execute(command: ExecutionCommand): Promise<number> {
        return new Promise<number>((resolve) => {
            try {
                if (!command.executable) {
                    resolve(1);
                    return;
                }

                // Node.js process spawn without shell string interpolation
                const child = spawn(command.executable, command.args, {
                    cwd: command.cwd || process.cwd(),
                    stdio: 'inherit',
                    env: process.env,
                    shell: false,
                });

                child.on('error', (err) => {
                    console.error(`[OEI Execution Failure] Failed to start process '${command.executable}': ${err.message}`);
                    resolve(1);
                });

                child.on('close', (code) => {
                    resolve(code ?? 0);
                });
            } catch (err: any) {
                console.error(`[OEI Execution Exception] ${err.message}`);
                resolve(1);
            }
        });
    }
}
