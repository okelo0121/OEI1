import React from "react";
import { Footer } from "../components/Footer";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface Finding {
    label: string;
    value: string;
    status: string;
}

interface RiskItem {
    label: string;
    level: RiskLevel;
}

const findings: Finding[] = [
    {
        label: "Impact",
        value: "Installs a new dependency to your project.",
        status: "EXPECTED",
    },
    {
        label: "Network",
        value: "Downloads packages from npm registry.",
        status: "REQUIRED",
    },
    {
        label: "Changes",
        value: "Updates package.json and lockfile.",
        status: "MINOR",
    },
];

const risks: RiskItem[] = [
    { label: "Delete files", level: "HIGH" },
    { label: "Breaking change", level: "MEDIUM" },
    { label: "Network access", level: "LOW" },
    { label: "Privileged action", level: "HIGH" },
];

function Arrow({ direction = "right", className = "" }: { direction?: "right" | "down"; className?: string }) {
    return (
        <span className={`diagram-arrow ${direction === "down" ? "diagram-arrow-down" : ""} ${className}`}>
            →
        </span>
    );
}

function CommandAnalysis() {
    return (
        <div className="analysis-card">
            <div className="analysis-title">Analyze a command</div>

            <div className="terminal-input">
                <span className="terminal-prompt">$</span>
                <span>npm install @solana/web3.js</span>
                <button className="copy-btn" title="Copy command" aria-label="Copy command">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                </button>
            </div>

            <div className="analysis-heading">Analysis Summary</div>

            <div className="analysis-summary">
                <div className="risk-summary">
                    <div className="risk-ring">
                        <div className="risk-ring-inner" />
                    </div>

                    <div>
                        <div className="risk-title">Low Risk</div>
                        <div className="risk-description">
                            This command is safe to run.
                        </div>
                        <span className="risk-pill">LOW</span>
                    </div>
                </div>

                <div className="finding-list">
                    {findings.map((finding) => (
                        <div className="finding-row" key={finding.label}>
                            <span className="finding-label">{finding.label}</span>
                            <span className="finding-value">{finding.value}</span>
                            <span className="finding-status">{finding.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-heading recommendations-heading">
                Recommendations
            </div>

            <div className="recommendation">
                <span className="recommendation-mark">✓</span>

                <div>
                    <strong>Safe to proceed.</strong>
                    <p>Consider running npm audit after installation.</p>
                </div>
            </div>

            <div className="environment-row">
                <div>
                    <span className="meta-label">Environment</span>
                    <span>Node 20.11.1</span>
                    <span className="meta-dot">•</span>
                    <span>npm 10.2.4</span>
                    <span className="meta-dot">•</span>
                    <span>macOS 14.4</span>
                </div>

                <div>
                    <span className="meta-label">Project</span>
                    <span>Next.js</span>
                    <span className="meta-dot">•</span>
                    <span>TypeScript</span>
                </div>
            </div>
        </div>
    );
}

function WorkflowDiagram() {
    return (
        <section className="workflow-section-wrapper">
            <div className="workflow-section" id="protocol">
                <div className="workflow-intro">
                    <h2>How OEI works</h2>
                    <p>
                        OEI combines static analysis, environment awareness, and community
                        knowledge to help you make confident decisions.
                    </p>

                    <a href="#protocol" className="text-link">
                        Learn more about the protocol <span>→</span>
                    </a>
                </div>

                <div className="workflow-flow">
                    <div className="workflow-card wf-card-1">
                        <span className="step-number">1. Input</span>
                        <strong>Command or workflow</strong>

                        <div className="mini-terminal">
                            <span className="wf-term-prompt">$ git push</span>
                            <span className="wf-term-arg">--force</span>
                        </div>
                    </div>

                    <Arrow className="wf-arrow-1" />

                    <div className="workflow-card wf-card-2">
                        <span className="step-number">2. Context</span>
                        <strong>Environment &amp; Project</strong>

                        <div className="node-diagram context-diagram">
                            <svg width="100%" height="45" viewBox="0 0 100 45">
                                <circle cx="50" cy="8" r="4" fill="#666" className="wf-node wf-node-root" />
                                <circle cx="20" cy="36" r="4" fill="#666" className="wf-node wf-node-left" />
                                <circle cx="50" cy="36" r="4" fill="#666" className="wf-node wf-node-mid" />
                                <circle cx="80" cy="36" r="4" fill="#666" className="wf-node wf-node-right" />
                                <line x1="50" y1="12" x2="20" y2="32" stroke="#aaa" strokeWidth="1.5" className="wf-line wf-line-left" />
                                <line x1="50" y1="12" x2="50" y2="32" stroke="#aaa" strokeWidth="1.5" className="wf-line wf-line-mid" />
                                <line x1="50" y1="12" x2="80" y2="32" stroke="#aaa" strokeWidth="1.5" className="wf-line wf-line-right" />
                            </svg>
                        </div>
                    </div>

                    <Arrow className="wf-arrow-2" />

                    <div className="workflow-card wf-card-3">
                        <span className="step-number">3. Analysis</span>
                        <strong>Risk, impact &amp; compatibility</strong>

                        <div className="analysis-grid">
                            {Array.from({ length: 36 }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`analysis-square square-${index}`}
                                />
                            ))}
                        </div>
                    </div>

                    <Arrow className="wf-arrow-3" />

                    <div className="workflow-card wf-card-4">
                        <span className="step-number">4. Recommendations</span>
                        <strong>Better options &amp; guidance</strong>

                        <div className="recommendation-lines">
                            <span className="rec-bar rec-bar-1" />
                            <span className="rec-bar rec-bar-2" />
                            <span className="rec-bar rec-bar-3" />
                            <span className="rec-bar rec-bar-4" />
                        </div>
                    </div>

                    <Arrow className="wf-arrow-4" />

                    <div className="workflow-card wf-card-5">
                        <span className="step-number">5. Decision</span>
                        <strong>You stay in control</strong>

                        <div className="decision-diagram">
                            <svg width="100%" height="45" viewBox="0 0 100 45">
                                <path d="M 15 22 L 60 12" stroke="#888" strokeWidth="1.5" fill="none" className="wf-dec-line wf-dec-line-top" />
                                <path d="M 15 22 L 60 32" stroke="#888" strokeWidth="1.5" fill="none" className="wf-dec-line wf-dec-line-bot" />
                                <rect x="65" y="4" width="18" height="18" rx="4" fill="#080808" className="wf-dec-box wf-dec-box-yes" />
                                <text x="74" y="17" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" className="wf-dec-text wf-dec-text-yes">✓</text>
                                <rect x="65" y="24" width="18" height="18" rx="4" fill="#fff" stroke="#ccc" strokeWidth="1" className="wf-dec-box wf-dec-box-no" />
                                <text x="74" y="37" fill="#666" fontSize="11" fontWeight="bold" textAnchor="middle" className="wf-dec-text wf-dec-text-no">×</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function EnvironmentDiagram() {
    return (
        <div className="feature-card feature-card-env">
            <div className="environment-diagram">
                <div className="env-inputs">
                    <span className="env-badge env-os">OS</span>
                    <span className="env-badge env-runtime">Runtime</span>
                    <span className="env-badge env-tools">Tools</span>
                </div>

                <div className="env-lines-svg">
                    <svg width="100%" height="28" viewBox="0 0 200 28">
                        <path className="env-path env-path-left" d="M 35 0 L 35 12 Q 35 18 50 18 L 100 18" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="6 4" />
                        <path className="env-path env-path-mid" d="M 100 0 L 100 18" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="6 4" />
                        <path className="env-path env-path-right" d="M 165 0 L 165 12 Q 165 18 150 18 L 100 18" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="6 4" />
                        <line className="env-path env-path-stem" x1="100" y1="18" x2="100" y2="24" stroke="#aaaaaa" strokeWidth="1.2" />
                        <polygon className="env-arrowhead" points="97,22 100,26 103,22" fill="#888888" />
                    </svg>
                </div>

                <div className="env-result">Project Context</div>
            </div>
        </div>
    );
}

function RiskDiagram() {
    return (
        <div className="feature-card feature-card-risk">
            <div className="risk-container">
                <div className="risk-scan-line" />
                <div className="risk-table">
                    {risks.map((risk, index) => (
                        <div className={`risk-table-row risk-row-${index}`} key={risk.label}>
                            <span>{risk.label}</span>
                            <span className="risk-level-text">{risk.level.charAt(0) + risk.level.slice(1).toLowerCase()}</span>
                            <span className={`risk-dot risk-dot-${risk.level.toLowerCase()}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TrustDiagram() {
    return (
        <div className="feature-card feature-card-trust">
            <div className="trust-diagram">
                <div className="trust-flow">
                    <div className="trust-box trust-publisher">Publisher</div>
                    <div className="trust-arrow trust-arrow-1">
                        <svg width="20" height="12" viewBox="0 0 20 12">
                            <line x1="0" y1="6" x2="14" y2="6" stroke="#999999" strokeWidth="1.2" className="trust-line-1" />
                            <polygon points="12,3 18,6 12,9" fill="#888888" className="trust-head-1" />
                        </svg>
                    </div>
                    <div className="trust-box trust-main">
                        <div>Solana</div>
                        <div>Registry</div>
                    </div>
                    <div className="trust-arrow trust-arrow-2">
                        <svg width="20" height="12" viewBox="0 0 20 12">
                            <line x1="0" y1="6" x2="14" y2="6" stroke="#999999" strokeWidth="1.2" className="trust-line-2" />
                            <polygon points="12,3 18,6 12,9" fill="#888888" className="trust-head-2" />
                        </svg>
                    </div>
                    <div className="trust-box trust-analyzer">Verified Analyzer</div>
                </div>

                <div className="signature-connector">
                    <svg width="100%" height="28" viewBox="0 0 200 28">
                        <path className="sig-path" d="M 100 0 L 100 12" stroke="#aaaaaa" strokeWidth="1.2" strokeDasharray="3 3" />
                        <polygon className="sig-arrow" points="97,4 100,0 103,4" fill="#888888" />
                    </svg>
                    <div className="signature-badge">Signature</div>
                </div>
            </div>
        </div>
    );
}

function IntegrationDiagram() {
    return (
        <div className="feature-card feature-card-works">
            <div className="integration-diagram">
                <div className="integration-column integration-inputs">
                    <span className="integ-node node-ide">IDE</span>
                    <span className="integ-node node-term">Terminal</span>
                    <span className="integ-node node-ci">CI / CD</span>
                    <span className="integ-node node-edit">Editors</span>
                </div>

                <div className="integration-svg-left">
                    <svg width="32" height="90" viewBox="0 0 32 90">
                        <path className="integ-path path-ide" d="M 0 12 C 16 12, 16 45, 32 45" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                        <path className="integ-path path-term" d="M 0 35 C 16 35, 16 45, 32 45" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                        <path className="integ-path path-ci" d="M 0 58 C 16 58, 16 45, 32 45" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                        <path className="integ-path path-edit" d="M 0 80 C 16 80, 16 45, 32 45" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                    </svg>
                </div>

                <div className="integration-core">
                    <div>OEI</div>
                    <div>API &amp; MCP</div>
                </div>

                <div className="integration-svg-right">
                    <svg width="32" height="90" viewBox="0 0 32 90">
                        <path className="integ-path path-agents" d="M 0 45 C 16 45, 16 20, 32 20" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                        <path className="integ-path path-tools" d="M 0 45 C 16 45, 16 45, 32 45" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                        <path className="integ-path path-scripts" d="M 0 45 C 16 45, 16 70, 32 70" stroke="#aaaaaa" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                    </svg>
                </div>

                <div className="integration-column integration-outputs">
                    <span className="integ-node node-agents">AI Agents</span>
                    <span className="integ-node node-out-tools">Tools</span>
                    <span className="integ-node node-scripts">Scripts</span>
                </div>
            </div>
        </div>
    );
}

function StoryRowsSection() {
    return (
        <section className="story-rows-wrapper">
            <section className="story-rows-section">
                {/* 01 — Environment Aware */}
                <div className="story-row story-row-1">
                    <div className="story-diagram-col">
                        <EnvironmentDiagram />
                    </div>
                    <div className="story-content-col">
                        <span className="story-step">01</span>
                        <h3>Environment Aware</h3>
                        <p>
                            OEI first understands the environment surrounding an action — inspecting your OS, runtimes, tools, and project context — before analyzing any command or workflow.
                        </p>
                    </div>
                </div>

                <div className="story-divider" />

                {/* 02 — Risk Detection */}
                <div className="story-row story-row-2 story-row-reverse">
                    <div className="story-content-col">
                        <span className="story-step">02</span>
                        <h3>Risk Detection</h3>
                        <p>
                            Evaluates actions against gathered context to catch destructive, insecure, or incompatible commands, surfacing potential risks and impacts before execution.
                        </p>
                    </div>
                    <div className="story-diagram-col">
                        <RiskDiagram />
                    </div>
                </div>

                <div className="story-divider" />

                {/* 03 — Trusted Intelligence */}
                <div className="story-row story-row-3">
                    <div className="story-diagram-col">
                        <TrustDiagram />
                    </div>
                    <div className="story-content-col">
                        <span className="story-step">03</span>
                        <h3>Trusted Intelligence</h3>
                        <p>
                            Uses verified analyzers and a decentralized trust layer backed by Solana, providing cryptographic signature verification and transparent reputation for rule providers.
                        </p>
                    </div>
                </div>

                <div className="story-divider" />

                {/* 04 — Works Everywhere */}
                <div className="story-row story-row-4 story-row-reverse">
                    <div className="story-content-col">
                        <span className="story-step">04</span>
                        <h3>Works Everywhere</h3>
                        <p>
                            An intelligence layer that connects directly into your existing developer tools and workflows — including IDEs, terminals, CI/CD pipelines, MCP servers, AI agents, tools, and custom scripts.
                        </p>
                    </div>
                    <div className="story-diagram-col">
                        <IntegrationDiagram />
                    </div>
                </div>
            </section>
        </section>
    );
}

function CoreIdeaSection() {
    return (
        <section className="core-idea-wrapper">
            <div className="core-idea-section">
                <span className="core-idea-eyebrow">Before you execute.</span>
                <h2>Understand. Analyze. Decide.</h2>
                <p className="core-idea-highlight">You stay in control.</p>
            </div>
        </section>
    );
}

function IntegrationStrip() {
    return (
        <div className="integration-strip">
            <div className="integration-title">
                Integrate once. Use everywhere.
            </div>

            <div className="integration-logos">
                <div className="integration-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.15 2.587l-16.5 16.5-5.25-5.25L0 15.25l6.65 6.65L24 4.002z" />
                    </svg>
                    <span>VS Code</span>
                </div>

                <div className="integration-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 17 22 12" />
                    </svg>
                    <span>Cursor</span>
                </div>

                <div className="integration-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 22h20L12 2zm0 4l6.5 13h-13L12 6z" />
                    </svg>
                    <span>Windsurf</span>
                </div>

                <div className="integration-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub Actions</span>
                </div>

                <div className="integration-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="3" fill="#ffffff" />
                        <text x="12" y="16" fill="#080808" fontSize="10" fontWeight="bold" textAnchor="middle">JB</text>
                    </svg>
                    <span>JetBrains</span>
                </div>

                <div className="integration-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>Claude</span>
                </div>

                <div className="integration-brand muted-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                    <span>More coming...</span>
                </div>
            </div>
        </div>
    );
}

function EcosystemSection({ onNavigate }: { onNavigate: (route: string) => void }) {
    return (
        <section className="dark-ecosystem-wrapper">
            <IntegrationStrip />

            <div className="ecosystem-section" id="ecosystem">
                <div className="ecosystem-copy">
                    <h2>
                        Open ecosystem.
                        <br />
                        Built on trust.
                    </h2>

                    <p>
                        OEI is an open protocol. Anyone can build analyzers, plugins, and
                        integrations. Solana provides a transparent layer of identity,
                        reputation, and verification.
                    </p>

                    <a href="#registry" onClick={(e) => { e.preventDefault(); onNavigate("/registry"); }} className="text-link">
                        Explore the registry <span>→</span>
                    </a>
                </div>

                <div className="ecosystem-flow-wrapper">
                    <div className="ecosystem-flow">
                        <div className="eco-node eco-node-1">
                            <div className="eco-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div>Community</div>
                            <small>Contributors</small>
                        </div>

                        <Arrow className="eco-arrow-1" />

                        <div className="eco-node eco-node-2">
                            <div className="eco-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                            </div>
                            <div>Analyzers</div>
                            <small>&amp; Plugins</small>
                        </div>

                        <Arrow className="eco-arrow-2" />

                        <div className="eco-node eco-node-main eco-node-3">
                            <div className="eco-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 18h14.5l1.5-2H5.5L4 18zm0-6h14.5l1.5-2H5.5L4 12zm16-8H5.5L4 6h14.5l1.5-2z" />
                                </svg>
                            </div>
                            <div>Solana</div>
                            <div>Registry</div>
                            <small className="eco-tag">(on-chain)</small>
                        </div>

                        <Arrow className="eco-arrow-3" />

                        <div className="eco-node eco-node-4">
                            <div className="eco-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <div>Verified</div>
                            <small>&amp; Trusted</small>
                        </div>

                        <Arrow className="eco-arrow-4" />

                        <div className="eco-node eco-node-5">
                            <div className="eco-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="12" cy="7" r="4" />
                                    <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                                </svg>
                            </div>
                            <div>Developers</div>
                            <small>&amp; AI Agents</small>
                        </div>
                    </div>

                    <div className="eco-dashed-loop">
                        <svg width="100%" height="30" viewBox="0 0 500 30" preserveAspectRatio="none">
                            <path className="eco-loop-path" d="M 50 5 L 50 20 Q 50 25 60 25 L 440 25 Q 450 25 450 20 L 450 5" stroke="#aaa" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                            <polygon className="eco-loop-head-left" points="47,9 50,2 53,9" fill="#aaa" />
                            <polygon className="eco-loop-head-right" points="447,9 450,2 453,9" fill="#aaa" />
                        </svg>
                        <div className="eco-footer-text">
                            <span>Reputation</span>
                            <span>•</span>
                            <span>Transparency</span>
                            <span>•</span>
                            <span>Verification</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Testimonials() {
    const testimonials = [
        {
            name: "Alex R.",
            role: "Engineering Lead",
            text: "OEI prevented so many mistakes in our CI pipeline. It's like a second pair of eyes that actually understands the context.",
            brand: "github",
        },
        {
            name: "Priya S.",
            role: "Developer Advocate",
            text: "The recommendations are incredibly practical. OEI helps both juniors and seniors ship with confidence.",
            brand: "vercel",
        },
        {
            name: "Michael T.",
            role: "AI Engineer",
            text: "Finally, a standard way for AI agents to understand the impact of actions before executing them.",
            brand: "anthropic",
        },
    ];

    return (
        <section className="testimonials-wrapper">
            <div className="testimonials-section">
                <h2>Loved by developers</h2>

                <div className="testimonial-grid">
                    {testimonials.map((testimonial) => (
                        <article className="testimonial-card" key={testimonial.name}>
                            <div className="testimonial-header">
                                <div className="avatar-img-wrapper">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                        <circle cx="20" cy="20" r="20" fill="#e2e8f0" />
                                        <circle cx="20" cy="15" r="7" fill="#64748b" />
                                        <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#64748b" />
                                    </svg>
                                </div>
                            </div>

                            <p>“{testimonial.text}”</p>

                            <div className="testimonial-footer">
                                <div className="testimonial-author">
                                    <strong>{testimonial.name}</strong>
                                    <span>{testimonial.role}</span>
                                </div>

                                <div className="testimonial-brand-icon">
                                    {testimonial.brand === "github" && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                    )}
                                    {testimonial.brand === "vercel" && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 1L24 22H0L12 1Z" />
                                        </svg>
                                    )}
                                    {testimonial.brand === "anthropic" && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6-4.5h7.5z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCTA({ onNavigate }: { onNavigate: (route: string) => void }) {
    return (
        <div className="final-cta-wrapper">
            <div className="final-cta">
                <div className="cta-terminal">
                    <span>&gt;_</span>
                </div>

                <div className="cta-copy">
                    <h3>Ready to build safer?</h3>
                    <p>Get started in minutes and add execution intelligence to your workflow.</p>
                </div>

                <div className="cta-actions">
                    <a href="#docs" onClick={(e) => { e.preventDefault(); onNavigate("/docs"); }} className="button button-dark-contrast">
                        Install OEI CLI
                        <span className="btn-terminal-icon">&gt;_</span>
                    </a>

                    <a href="#docs" onClick={(e) => { e.preventDefault(); onNavigate("/docs"); }} className="button button-light-contrast">
                        Read the Docs
                        <span>→</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export function LandingPage({ onNavigate }: { onNavigate: (route: string) => void }) {
    return (
        <div className="landing-page-content">
            <section className="hero-wrapper">
                <section className="hero" id="overview">
                    <div className="hero-copy">
                        <h1>
                            Smarter actions.
                            <br />
                            Safer development.
                        </h1>

                        <p>
                            OEI analyzes developer commands and workflows in the context of
                            your environment to surface risks, impacts, and better
                            alternatives — before you run them.
                        </p>

                        <div className="hero-actions">
                            <a href="#docs" onClick={(e) => { e.preventDefault(); onNavigate("/docs"); }} className="button button-dark-contrast button-large">
                                Try OEI CLI
                                <span className="btn-terminal-icon">&gt;_</span>
                            </a>

                            <a href="#api" onClick={(e) => { e.preventDefault(); onNavigate("/api"); }} className="button button-light-contrast button-large">
                                Explore API
                                <span>→</span>
                            </a>
                        </div>

                        <div className="stats-container">
                            <div className="stats-label">Trusted by developers and AI agents</div>
                            <div className="stats">
                                <div>
                                    <strong>10K+</strong>
                                    <span>Developers</span>
                                </div>

                                <div>
                                    <strong>1M+</strong>
                                    <span>Analyses</span>
                                </div>

                                <div>
                                    <strong>200+</strong>
                                    <span>Projects</span>
                                </div>

                                <div>
                                    <strong>50+</strong>
                                    <span>Plugins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CommandAnalysis />
                </section>
            </section>

            <WorkflowDiagram />

            <StoryRowsSection />

            <CoreIdeaSection />

            <EcosystemSection onNavigate={onNavigate} />

            <Testimonials />

            <section className="dark-footer-group">
                <FinalCTA onNavigate={onNavigate} />
                <Footer onNavigate={onNavigate} />
            </section>
        </div>
    );
}
