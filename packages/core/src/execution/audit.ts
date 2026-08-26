import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { ExecutionAudit } from '@oei/types';

export class AuditLogger {
    /**
     * Append lightweight ExecutionAudit log record to .oei/audit.jsonl.
     * Ensures zero secrets, environment keys, or tokens are persisted.
     */
    static log(audit: ExecutionAudit, customPath?: string): void {
        try {
            const auditFilePath = customPath || join(process.cwd(), '.oei', 'audit.jsonl');
            const targetDir = dirname(auditFilePath);

            if (!existsSync(targetDir)) {
                mkdirSync(targetDir, { recursive: true });
            }

            const record = JSON.stringify(audit) + '\n';
            appendFileSync(auditFilePath, record, 'utf-8');
        } catch (err: any) {
            // Failure to write audit log must not crash main execution
            console.error(`[OEI Audit Failure] Unable to write audit log: ${err.message}`);
        }
    }
}
