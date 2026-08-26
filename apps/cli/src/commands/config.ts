import { Command } from 'commander';
import { ConfigService } from '@oei/core';

export function registerConfigCommands(program: Command) {
    const configGroup = program
        .command('config')
        .description('Manage OEI system and AI provider configuration');

    const service = new ConfigService();

    configGroup
        .command('get [key]')
        .description('Get a configuration value (secrets masked)')
        .action((key?: string) => {
            if (!key) {
                const list = service.getMaskedList();
                console.log('\n=== OEI Configuration ===');
                for (const [k, v] of Object.entries(list)) {
                    console.log(`  ${k} = ${v}`);
                }
                console.log('');
                return;
            }

            const val = service.get(key);
            const masked = service.maskValue(key, val);
            console.log(`${key} = ${masked}`);
        });

    configGroup
        .command('list')
        .description('List all configuration keys and values (secrets masked)')
        .action(() => {
            const list = service.getMaskedList();
            console.log('\n=== OEI Configuration ===');
            for (const [k, v] of Object.entries(list)) {
                console.log(`  ${k} = ${v}`);
            }
            console.log('');
        });

    configGroup
        .command('set <key> <value>')
        .description('Set a configuration key and value')
        .action((key: string, value: string) => {
            try {
                service.set(key, value);
                const masked = service.maskValue(key, value);
                console.log(`Updated configuration: ${key} = ${masked}`);
            } catch (err: any) {
                console.error(`\nOEI Error\n\n${err.message || err}\n`);
                process.exit(1);
            }
        });
}
