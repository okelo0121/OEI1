import React, { useState } from "react";

interface DocsPageProps {
    onNavigate: (route: string) => void;
}

const docCategories = [
    {
        title: "GET STARTED",
        items: [
            { id: "intro", label: "Introduction" },
            { id: "installation", label: "Installation" },
            { id: "quickstart", label: "Quickstart" },
        ],
    },
    {
        title: "CONCEPTS",
        items: [
            { id: "what-is-oei", label: "What is OEI?" },
            { id: "architecture", label: "Architecture" },
            { id: "execution-context", label: "Execution Context" },
            { id: "risk-analysis", label: "Risk Analysis" },
            { id: "recommendations", label: "Recommendations" },
        ],
    },
    {
        title: "TOOLS",
        items: [
            { id: "cli", label: "CLI Reference" },
            { id: "api", label: "API Reference" },
            { id: "mcp", label: "MCP Server" },
            { id: "plugins", label: "Plugins" },
        ],
    },
    {
        title: "BUILDING",
        items: [
            { id: "analyzers", label: "Building Analyzers" },
            { id: "integrations", label: "Integrations" },
            { id: "config", label: "Configuration" },
        ],
    },
    {
        title: "COMMUNITY",
        items: [
            { id: "contributing", label: "Contributing" },
            { id: "create-plugins", label: "Creating Plugins" },
        ],
    },
];

export function DocsPage({ onNavigate }: DocsPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeDocId, setActiveDocId] = useState("intro");

    const filteredCategories = docCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((cat) => cat.items.length > 0);

    return (
        <div className="docs-page">
            {/* Docs Main Layout: Sidebar on Left, All Content on Right */}
            <div className="docs-container">
                {/* Sidebar Navigation */}
                <aside className="docs-sidebar">
                    {filteredCategories.map((cat) => (
                        <div key={cat.title} className="docs-cat-group">
                            <h4 className="docs-cat-title">{cat.title}</h4>
                            <ul className="docs-cat-list">
                                {cat.items.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            className={`docs-link ${activeDocId === item.id ? "active" : ""}`}
                                            onClick={() => setActiveDocId(item.id)}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </aside>

                {/* Right Area: Header, Diagram, and Article Content */}
                <div className="docs-main-area">
                    {/* Docs Header & Search */}
                    <div className="docs-header">
                        <div className="eyebrow">Documentation</div>
                        <h1>Build with execution intelligence.</h1>
                        <p>
                            Comprehensive guides, architectural reference, CLI usage, API schemas,
                            MCP server configuration, and analyzer extension guides for OEI.
                        </p>

                        <div className="docs-search-bar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search documentation (e.g., installation, risk, MCP, API)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Primary Animated Technical Diagram: OEI Analysis Pipeline */}
                    <div className="docs-diagram-container">
                        <div className="diagram-title">OEI Analysis Pipeline</div>
                        <div className="pipeline-diagram">
                            <div className="pipe-node pipe-node-action">
                                <span className="pipe-step">01</span>
                                <strong>Developer Action</strong>
                                <small>Command / Script</small>
                            </div>

                            <div className="pipe-connector pipe-conn-1">
                                <div className="pipe-pulse" />
                                <svg width="40" height="12" viewBox="0 0 40 12">
                                    <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                    <polygon points="30,3 38,6 30,9" fill="#888888" />
                                </svg>
                            </div>

                            <div className="pipe-node pipe-node-env">
                                <span className="pipe-step">02</span>
                                <strong>Environment</strong>
                                <small>OS &amp; Runtimes</small>
                            </div>

                            <div className="pipe-connector pipe-conn-2">
                                <div className="pipe-pulse" />
                                <svg width="40" height="12" viewBox="0 0 40 12">
                                    <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                    <polygon points="30,3 38,6 30,9" fill="#888888" />
                                </svg>
                            </div>

                            <div className="pipe-node pipe-node-context">
                                <span className="pipe-step">03</span>
                                <strong>Context</strong>
                                <small>Git &amp; Config</small>
                            </div>

                            <div className="pipe-connector pipe-conn-3">
                                <div className="pipe-pulse" />
                                <svg width="40" height="12" viewBox="0 0 40 12">
                                    <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                    <polygon points="30,3 38,6 30,9" fill="#888888" />
                                </svg>
                            </div>

                            <div className="pipe-node pipe-node-analyzer">
                                <span className="pipe-step">04</span>
                                <strong>OEI Analyzer</strong>
                                <small>Static &amp; Verified</small>
                            </div>

                            <div className="pipe-connector pipe-conn-4">
                                <div className="pipe-pulse" />
                                <svg width="40" height="12" viewBox="0 0 40 12">
                                    <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                    <polygon points="30,3 38,6 30,9" fill="#888888" />
                                </svg>
                            </div>

                            <div className="pipe-node pipe-node-result">
                                <span className="pipe-step">05</span>
                                <strong>Risk &amp; Guidance</strong>
                                <small>Recommendation</small>
                            </div>

                            <div className="pipe-connector pipe-conn-5">
                                <div className="pipe-pulse" />
                                <svg width="40" height="12" viewBox="0 0 40 12">
                                    <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                    <polygon points="30,3 38,6 30,9" fill="#888888" />
                                </svg>
                            </div>

                            <div className="pipe-node pipe-node-decision">
                                <span className="pipe-step">06</span>
                                <strong>Decision</strong>
                                <small>You Stay in Control</small>
                            </div>
                        </div>
                    </div>

                    {/* Article Content Panel */}
                    <div className="docs-content">
                        {activeDocId === "intro" && (
                            <article className="doc-article">
                                <h2>Introduction to OEI</h2>
                                <p className="lead-p">
                                    Open Execution Intelligence (OEI) is an open-source protocol and runtime tool
                                    that analyzes developer commands, scripts, and automated agent actions before execution.
                                </p>

                                <h3>Core Philosophy</h3>
                                <p>
                                    Modern software development involves complex terminal commands, package installations,
                                    cloud infrastructure deployments, and autonomous AI agents. OEI provides a transparent
                                    safety and intelligence layer between human or AI intent and actual execution.
                                </p>

                                <div className="doc-callout">
                                    <strong>Key Principle:</strong> OEI does not blindly block or execute code. It surfaces
                                    environment-aware risk, expected side effects, and actionable alternatives so developers stay in total control.
                                </div>

                                <h3>Quick Install</h3>
                                <div className="code-block-header">Terminal / Shell</div>
                                <pre className="doc-code-block">
                                    <code>
                                        {`# Install OEI CLI globally via npm\nnpm install -g @oei/cli\n\n# Verify installation\noei --version`}
                                    </code>
                                </pre>

                                <h3>How It Works</h3>
                                <ol>
                                    <li><strong>Input Capture:</strong> OEI intercepts command invocations from your shell, IDE, or CI pipeline.</li>
                                    <li><strong>Environment Discovery:</strong> Gathers current OS version, Node/Python runtimes, active git branch, and project lockfiles.</li>
                                    <li><strong>Rule Evaluation:</strong> Runs fast static analyzers against the command and environment context.</li>
                                    <li><strong>Structured Output:</strong> Displays risk severity, package side effects, network access requirements, and safe recommendations.</li>
                                </ol>

                                <div className="doc-next-steps">
                                    <h4>Next Steps</h4>
                                    <div className="next-steps-grid">
                                        <button onClick={() => setActiveDocId("quickstart")} className="next-card">
                                            <strong>Quickstart Guide →</strong>
                                            <span>Run your first OEI command in under 2 minutes.</span>
                                        </button>
                                        <button onClick={() => setActiveDocId("architecture")} className="next-card">
                                            <strong>Architecture Overview →</strong>
                                            <span>Learn how the analysis pipeline inspects execution context.</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeDocId === "installation" && (
                            <article className="doc-article">
                                <h2>Installation Guide</h2>
                                <p>OEI supports macOS, Linux, and Windows operating systems across Node.js 18+ runtimes.</p>

                                <h3>npm / pnpm / yarn</h3>
                                <pre className="doc-code-block">
                                    <code>{`npm install -g @oei/cli`}</code>
                                </pre>

                                <h3>Homebrew (macOS / Linux)</h3>
                                <pre className="doc-code-block">
                                    <code>{`brew install oei-protocol/tap/oei`}</code>
                                </pre>

                                <h3>Shell Auto-completion</h3>
                                <p>Add completion to your <code>.zshrc</code> or <code>.bashrc</code>:</p>
                                <pre className="doc-code-block">
                                    <code>{`eval "$(oei completion zsh)"`}</code>
                                </pre>
                            </article>
                        )}

                        {activeDocId === "quickstart" && (
                            <article className="doc-article">
                                <h2>Quickstart Guide</h2>
                                <p>Learn how to inspect commands before executing them in your workspace.</p>

                                <h3>1. Analyze a package installation</h3>
                                <pre className="doc-code-block">
                                    <code>{`oei analyze "npm install @solana/web3.js"`}</code>
                                </pre>

                                <h3>2. Analyze a git operation</h3>
                                <pre className="doc-code-block">
                                    <code>{`oei analyze "git push origin main --force"`}</code>
                                </pre>

                                <h3>3. Inspect current workspace context</h3>
                                <pre className="doc-code-block">
                                    <code>{`oei context show`}</code>
                                </pre>
                            </article>
                        )}

                        {activeDocId === "what-is-oei" && (
                            <article className="doc-article">
                                <h2>What is OEI?</h2>
                                <p>
                                    OEI stands for <strong>Open Execution Intelligence</strong>. It is a decentralized,
                                    open-standard protocol designed to prevent destructive actions, supply chain attacks,
                                    and unintended infrastructure modifications.
                                </p>
                            </article>
                        )}

                        {activeDocId === "architecture" && (
                            <article className="doc-article">
                                <h2>OEI Architecture</h2>
                                <p>
                                    OEI uses a modular pipeline decoupled into input handlers, context providers, static rule engines,
                                    cryptographic Solana signature verifiers, and client display layers.
                                </p>
                                <pre className="doc-code-block">
                                    <code>{`+-------------------------------------------------------+
|                 Developer Interface                   |
|           (CLI / VS Code / MCP Server / CI)           |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                    OEI Engine                         |
|  +--------------------+   +------------------------+  |
|  | Context Collector  |   | Verified Rule Engine   |  |
|  +--------------------+   +------------------------+  |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                 Solana Trust Layer                    |
|      (On-Chain Registry & Cryptographic Signatures)   |
+-------------------------------------------------------+`}</code>
                                </pre>
                            </article>
                        )}

                        {/* Placeholder fallback for any other active tab */}
                        {!["intro", "installation", "quickstart", "what-is-oei", "architecture"].includes(activeDocId) && (
                            <article className="doc-article">
                                <h2>{docCategories.flatMap((c) => c.items).find((i) => i.id === activeDocId)?.label || "Documentation"}</h2>
                                <p className="lead-p">
                                    Detailed documentation and specifications for this section.
                                </p>

                                <div className="doc-callout">
                                    <strong>Status:</strong> Active standard documentation topic.
                                </div>

                                <h3>Usage Example</h3>
                                <pre className="doc-code-block">
                                    <code>{`# Example OEI CLI invocation\noei ${activeDocId} --verbose`}</code>
                                </pre>
                            </article>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
