export class SolanaAnalyzer {
    name = 'SolanaAnalyzer';
    supports(cmd: string): boolean {
        return cmd.trim().startsWith('solana') || cmd.includes('@solana/web3.js');
    }
}
