import React from "react";

interface RegistryPageProps {
    onNavigate: (route: string) => void;
}

export function RegistryPage({ onNavigate }: RegistryPageProps) {
    return (
        <div className="registry-page">
            {/* Registry Hero */}
            <section className="registry-hero">
                <div className="registry-hero-inner">
                    <div className="eyebrow">Solana Trust Layer</div>
                    <h1>Decentralized trust &amp; verified intelligence.</h1>
                    <p>
                        OEI uses Solana as an immutable, low-cost trust registry. Analyzer publishers sign their rules with
                        Ed25519 cryptographic keys, allowing OEI clients to verify rule integrity on-chain before execution.
                    </p>
                </div>

                {/* Primary Animated Diagram */}
                <div className="registry-diagram-container">
                    <div className="diagram-title">On-Chain Signature Verification Flow</div>
                    <div className="reg-flow-diagram">
                        <div className="reg-node reg-node-author">
                            <span className="reg-badge">Publisher</span>
                            <strong>Analyzer Author</strong>
                            <small>Signs with Ed25519</small>
                        </div>

                        <div className="reg-arrow reg-arrow-1">
                            <div className="reg-dot" />
                            <svg width="40" height="12" viewBox="0 0 40 12">
                                <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                <polygon points="30,3 38,6 30,9" fill="#888888" />
                            </svg>
                        </div>

                        <div className="reg-node reg-node-solana">
                            <span className="reg-badge reg-badge-dark">Solana</span>
                            <strong>On-Chain Registry</strong>
                            <small>Program: OEI...111</small>
                        </div>

                        <div className="reg-arrow reg-arrow-2">
                            <div className="reg-dot" />
                            <svg width="40" height="12" viewBox="0 0 40 12">
                                <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                <polygon points="30,3 38,6 30,9" fill="#888888" />
                            </svg>
                        </div>

                        <div className="reg-node reg-node-client">
                            <span className="reg-badge reg-badge-success">Verified</span>
                            <strong>OEI Engine</strong>
                            <small>Executes Trusted Rule</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Registry Specs */}
            <section className="registry-content-section">
                <h2>Registry Architecture</h2>

                <div className="reg-grid-3">
                    <div className="reg-card">
                        <h3>1. Cryptographic Signatures</h3>
                        <p>
                            Rule publishers sign plugin SHA-256 digests with their private keys.
                            OEI clients verify signatures locally before executing any plugin logic.
                        </p>
                    </div>

                    <div className="reg-card">
                        <h3>2. Transparent Reputation</h3>
                        <p>
                            Solana state accounts maintain immutable records of publisher identity,
                            plugin versions, rule checksums, and community endorsement scores.
                        </p>
                    </div>

                    <div className="reg-card">
                        <h3>3. Zero-Trust Local Execution</h3>
                        <p>
                            Clients cache verified rules locally. If network connectivity drops,
                            OEI operates seamlessly using previously validated signature caches.
                        </p>
                    </div>
                </div>

                {/* On-chain Program Reference */}
                <div className="reg-program-box">
                    <h3>On-Chain Program Accounts</h3>

                    <div className="reg-account-list">
                        <div className="account-row">
                            <span className="acc-label">Registry Program ID</span>
                            <code>oeiReg1111111111111111111111111111111111111</code>
                        </div>

                        <div className="account-row">
                            <span className="acc-label">Network</span>
                            <span>Solana Devnet &amp; Mainnet-Beta</span>
                        </div>

                        <div className="account-row">
                            <span className="acc-label">Verification Standard</span>
                            <span>Ed25519 Signature + SHA-256 Hash Verification</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
