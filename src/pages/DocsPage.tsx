import React, { useState } from "react";

interface DocsPageProps {
    onNavigate: (route: string) => void;
}

const docCategories = [
    {
        title: "GET STARTED",
        items: [
            { id: "intro", label: "Introduction" },
            { id: "installation", label: "Installation & --force" },
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

function CodeSnippet({ code, header = "Terminal" }: { code: string; header?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="doc-code-wrapper">
            <div className="doc-code-topbar">
                <span className="doc-code-header-text">{header}</span>
                <button
                    className={`doc-copy-btn ${copied ? "copied" : ""}`}
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    aria-label="Copy to clipboard"
                >
                    {copied ? (
                        <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="doc-code-block">
                <code>{code}</code>
            </pre>
        </div>
    );
}

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
                                placeholder="Search documentation (e.g., install, force, cli, risk, MCP, API)..."
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

                                <h3>Quick Global Install</h3>
                                <p>The official OEI CLI is published to npm as <code>@okelo0121/oei-cli</code>:</p>
                                
                                <CodeSnippet
                                    header="Terminal / Shell"
                                    code={`# Install OEI CLI globally via npm
npm install -g @okelo0121/oei-cli

# Run system diagnostic verification
oei doctor

# Check version
oei --version`}
                                />

                                <div className="troubleshoot-hint-box">
                                    <div className="hint-header">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <strong>Installation Note:</strong>
                                    </div>
                                    <p>
                                        If you encounter a binary/symlink conflict (<code>EEXIST</code>) or global cache conflict, use{" "}
                                        <code>npm install -g @okelo0121/oei-cli --force</code> to overwrite stale binary links.{" "}
                                        <button className="link-inline-btn" onClick={() => setActiveDocId("installation")}>
                                            Read the full --force troubleshooting guide →
                                        </button>
                                    </p>
                                </div>

                                <h3>How It Works</h3>
                                <ol className="doc-steps-list">
                                    <li><strong>Input Capture:</strong> Intercepts commands from your shell, IDE, or CI pipeline.</li>
                                    <li><strong>Environment Discovery:</strong> Gathers OS version, Node/Python runtimes, active git branch, and lockfiles.</li>
                                    <li><strong>Rule Evaluation:</strong> Evaluates fast deterministic analyzers against execution context.</li>
                                    <li><strong>Structured Output:</strong> Surfaces risk severity, side effects, network access requirements, and safe alternatives.</li>
                                </ol>

                                <div className="doc-next-steps">
                                    <h4>Next Steps</h4>
                                    <div className="next-steps-grid">
                                        <button onClick={() => setActiveDocId("installation")} className="next-card">
                                            <strong>Installation &amp; --force Guide →</strong>
                                            <span>Install globally and resolve environment issues.</span>
                                        </button>
                                        <button onClick={() => setActiveDocId("quickstart")} className="next-card">
                                            <strong>Quickstart Guide →</strong>
                                            <span>Run your first analysis in under 2 minutes.</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeDocId === "installation" && (
                            <article className="doc-article">
                                <h2>Installation Guide</h2>
                                <p className="lead-p">
                                    OEI supports macOS, Linux, and Windows across Node.js 18+ runtimes. The official package is published to the npm registry as <code>@okelo0121/oei-cli</code>.
                                </p>

                                <h3>1. Primary Installation</h3>
                                <CodeSnippet
                                    header="npm (Recommended)"
                                    code={`npm install -g @okelo0121/oei-cli`}
                                />

                                <h3>Alternative Package Managers</h3>
                                <CodeSnippet
                                    header="pnpm & yarn"
                                    code={`# via pnpm
pnpm add -g @okelo0121/oei-cli

# via yarn
yarn global add @okelo0121/oei-cli

# Instant execution without global install (via npx)
npx -y @okelo0121/oei-cli analyze "git push origin main --force"`}
                                />

                                <h3>Homebrew (macOS / Linux)</h3>
                                <CodeSnippet
                                    header="brew"
                                    code={`brew install okelo0121/tap/oei`}
                                />

                                <h3>2. Verify Installation Health</h3>
                                <p>Run <code>oei doctor</code> to inspect environment health, Node versions, and system diagnostics:</p>
                                <CodeSnippet
                                    header="Verify Environment"
                                    code={`oei doctor`}
                                />

                                {/* DEDICATED TROUBLESHOOTING & FORCE SECTION */}
                                <div className="troubleshooting-section">
                                    <div className="troubleshooting-banner">
                                        <div className="banner-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                <line x1="12" y1="9" x2="12" y2="13" />
                                                <line x1="12" y1="17" x2="12.01" y2="17" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3>Troubleshooting: When and Why to Use <code>--force</code></h3>
                                            <p>
                                                If npm throws errors during global installation or package linking, you can use the <code>--force</code> flag.
                                            </p>
                                        </div>
                                    </div>

                                    <CodeSnippet
                                        header="Force Installation"
                                        code={`# Force install globally via npm
npm install -g @okelo0121/oei-cli --force

# On Linux/macOS with global permission restrictions:
sudo npm install -g @okelo0121/oei-cli --force`}
                                    />

                                    <h4>Why and When Should You Use <code>--force</code>?</h4>
                                    <div className="force-reasons-grid">
                                        <div className="force-reason-card">
                                            <div className="reason-tag">Scenario 01</div>
                                            <strong>Existing Binary / Symlink Conflict (<code>EEXIST</code>)</strong>
                                            <p>
                                                <strong>Reason:</strong> If you previously installed an older version or linked a local development build, an <code>oei</code> executable already exists in your global bin folder (<code>/usr/local/bin/oei</code> or <code>%APPDATA%\npm\oei</code>). By default, npm will abort to prevent overwriting existing files.
                                            </p>
                                            <p className="reason-fix">
                                                <strong>How <code>--force</code> helps:</strong> Passing <code>--force</code> tells npm to overwrite the stale executable and symlink, binding the global <code>oei</code> command directly to the latest <code>@okelo0121/oei-cli</code> package.
                                            </p>
                                        </div>

                                        <div className="force-reason-card">
                                            <div className="reason-tag">Scenario 02</div>
                                            <strong>Peer Dependency &amp; Resolution Strictness (<code>ERESOLVE</code>)</strong>
                                            <p>
                                                <strong>Reason:</strong> npm v7+ uses a strict dependency resolver. If you have conflicting global peer dependencies installed from other tools, npm may reject installing new packages into the shared global tree.
                                            </p>
                                            <p className="reason-fix">
                                                <strong>How <code>--force</code> helps:</strong> <code>--force</code> bypasses strict peer graph validation, allowing OEI's self-contained standalone binary to install cleanly without altering your existing global packages.
                                            </p>
                                        </div>

                                        <div className="force-reason-card">
                                            <div className="reason-tag">Scenario 03</div>
                                            <strong>Corrupted Global npm Cache or Stale Tarballs</strong>
                                            <p>
                                                <strong>Reason:</strong> Incomplete network downloads or interrupted previous installs can leave cached partial tarballs or outdated checksums in <code>~/.npm</code>.
                                            </p>
                                            <p className="reason-fix">
                                                <strong>How <code>--force</code> helps:</strong> <code>--force</code> instructs npm to bypass mismatched cache metadata, re-fetch the official tarball from <code>registry.npmjs.org</code>, and extract fresh build assets.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h3>Shell Auto-completion</h3>
                                <p>Add autocomplete to your <code>.zshrc</code> or <code>.bashrc</code>:</p>
                                <CodeSnippet
                                    header="Shell Completion"
                                    code={`# For Zsh
eval "$(oei completion zsh)"

# For Bash
eval "$(oei completion bash)"`}
                                />
                            </article>
                        )}

                        {activeDocId === "quickstart" && (
                            <article className="doc-article">
                                <h2>Quickstart Guide</h2>
                                <p className="lead-p">Learn how to inspect commands before executing them in your workspace.</p>

                                <h3>Step 1: Install OEI CLI</h3>
                                <CodeSnippet
                                    header="Terminal"
                                    code={`npm install -g @okelo0121/oei-cli`}
                                />

                                <h3>Step 2: Analyze a Package Installation</h3>
                                <p>Analyze whether an npm package executes untrusted postinstall scripts or creates breaking dependencies:</p>
                                <CodeSnippet
                                    header="Command Analysis"
                                    code={`oei analyze "npm install @solana/web3.js"`}
                                />

                                <h3>Step 3: Analyze a Destructive Git Operation</h3>
                                <p>Inspect risky git force pushes against production branches before execution:</p>
                                <CodeSnippet
                                    header="Git Analysis"
                                    code={`oei analyze "git push origin main --force"`}
                                />

                                <h3>Step 4: Execute with Safety Gates</h3>
                                <p>Let OEI evaluate the command and only run it if the risk policy passes:</p>
                                <CodeSnippet
                                    header="Execution Gate"
                                    code={`# Run in dry-run mode (safe preview)
oei exec "npm install express" --dry-run

# Run with interactive safety gate
oei exec "npm install express"`}
                                />

                                <h3>Step 5: Inspect Workspace Context</h3>
                                <CodeSnippet
                                    header="Workspace Context"
                                    code={`oei context show`}
                                />
                            </article>
                        )}

                        {activeDocId === "cli" && (
                            <article className="doc-article">
                                <h2>CLI Command Reference</h2>
                                <p className="lead-p">
                                    The OEI command-line interface (<code>@okelo0121/oei-cli</code>) provides fast, deterministic commands for risk analysis, gate execution, and system inspection.
                                </p>

                                <h3>1. <code>oei analyze "&lt;command&gt;"</code></h3>
                                <p>
                                    Analyzes a command against the OEI Knowledge &amp; Risk Engine.
                                    <strong>Safety Guarantee:</strong> <code>oei analyze</code> is strictly analysis-only and <em>never</em> spawns or executes the command.
                                </p>
                                <CodeSnippet
                                    header="Analyze Usage"
                                    code={`oei analyze "npm install express"
oei analyze "git push origin main --force"
oei analyze "solana program deploy target/deploy/app.so"`}
                                />

                                <h3>2. <code>oei exec "&lt;command&gt;" [flags]</code></h3>
                                <p>Evaluates a command through the OEI Execution Gate and conditionally executes it based on deterministic policy rules:</p>
                                <CodeSnippet
                                    header="Exec Usage"
                                    code={`# Execute with safety gate
oei exec "npm install express"

# Safe dry-run mode
oei exec "solana program deploy app.so" --dry-run

# Non-interactive confirmation for WARN actions
oei exec "npm install lodash" --yes`}
                                />

                                <h3>3. <code>oei doctor</code></h3>
                                <p>Inspects system health, Node runtime, shell paths, and registered analyzers:</p>
                                <CodeSnippet
                                    header="System Health"
                                    code={`oei doctor`}
                                />

                                <h3>4. <code>oei context</code></h3>
                                <p>Safely inspects active workspace environment, OS, Git branch, and lockfile state:</p>
                                <CodeSnippet
                                    header="Context Inspection"
                                    code={`oei context`}
                                />

                                <h3>5. <code>oei config</code></h3>
                                <p>Manages configuration settings persisted at <code>~/.oei/config.json</code>:</p>
                                <CodeSnippet
                                    header="Config Management"
                                    code={`oei config list
oei config get AI_PROVIDER
oei config set AI_PROVIDER mock`}
                                />

                                <h3>6. <code>oei knowledge</code></h3>
                                <p>Inspects registered knowledge sources and queries offline security advisories:</p>
                                <CodeSnippet
                                    header="Knowledge Query"
                                    code={`oei knowledge sources
oei knowledge search "Solana"`}
                                />

                                {/* FORCE & SAFETY GATE EXPLANATION */}
                                <div className="troubleshooting-section">
                                    <div className="troubleshooting-banner">
                                        <div className="banner-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3>OEI Safety Gate &amp; <code>--force</code> Policy</h3>
                                            <p>How OEI handles commands with force flags and confirmation overrides.</p>
                                        </div>
                                    </div>

                                    <div className="gate-policy-list">
                                        <div className="gate-row">
                                            <span className="gate-badge allow">ALLOW</span>
                                            <div>
                                                <strong>Safe Execution:</strong> Runs immediately without prompting.
                                            </div>
                                        </div>
                                        <div className="gate-row">
                                            <span className="gate-badge warn">WARN</span>
                                            <div>
                                                <strong>Potential Risk Detected:</strong> Requires interactive confirmation <code>[y/N]</code>. Can be confirmed with <code>--yes</code> / <code>-y</code> in automated CI scripts.
                                            </div>
                                        </div>
                                        <div className="gate-row">
                                            <span className="gate-badge block">BLOCK</span>
                                            <div>
                                                <strong>Destructive Action Intercepted:</strong> Commands flagged as <code>BLOCK</code> (such as force-pushing to production branch <code>main</code> or executing obfuscated postinstall scripts) exit with code <code>2</code> and <em>NEVER</em> execute. Passing <code>--yes</code> or <code>--force</code> on a <code>BLOCK</code> action will <strong>NEVER</strong> bypass safety gates.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeDocId === "what-is-oei" && (
                            <article className="doc-article">
                                <h2>What is OEI?</h2>
                                <p className="lead-p">
                                    OEI stands for <strong>Open Execution Intelligence</strong>. It is a decentralized,
                                    open-standard protocol designed to prevent destructive actions, supply chain attacks,
                                    and unintended infrastructure modifications.
                                </p>
                                <p>
                                    Whether you run commands manually in your terminal, trigger builds in CI/CD, or let AI agents execute actions in your IDE, OEI operates as an execution gate to verify safety and recommend safe alternatives.
                                </p>
                            </article>
                        )}

                        {activeDocId === "architecture" && (
                            <article className="doc-article">
                                <h2>OEI Architecture</h2>
                                <p className="lead-p">
                                    OEI uses a modular pipeline decoupled into input handlers, context providers, static rule engines,
                                    cryptographic Solana signature verifiers, and client display layers.
                                </p>
                                <CodeSnippet
                                    header="Architecture Map"
                                    code={`+-------------------------------------------------------+
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
+-------------------------------------------------------+`}
                                />
                            </article>
                        )}

                        {activeDocId === "execution-context" && (
                            <article className="doc-article">
                                <h2>Execution Context</h2>
                                <p className="lead-p">
                                    OEI analyzes commands in the exact context of your project environment rather than evaluating abstract syntax in isolation.
                                </p>
                                <h3>Collected Metadata</h3>
                                <ul>
                                    <li><strong>Runtime Environment:</strong> Active Node.js, Python, Rust, or Go binary versions and active shell ($SHELL, cmd, powershell).</li>
                                    <li><strong>Git Repository State:</strong> Current branch (e.g. <code>main</code> vs <code>feature/xyz</code>), uncommitted changes, upstream tracking, and commit history.</li>
                                    <li><strong>Project Lockfiles:</strong> Detected <code>package-lock.json</code>, <code>pnpm-lock.yaml</code>, <code>yarn.lock</code>, or <code>Cargo.lock</code>.</li>
                                </ul>
                                <CodeSnippet
                                    header="Inspect Current Context"
                                    code={`oei context`}
                                />
                            </article>
                        )}

                        {activeDocId === "risk-analysis" && (
                            <article className="doc-article">
                                <h2>Risk Analysis Engine</h2>
                                <p className="lead-p">
                                    Deterministic multi-layer risk scoring evaluates potential side effects, network access requirements, and destructive actions.
                                </p>
                                <h3>Severity Classifications</h3>
                                <ul>
                                    <li><strong>LOW (0 - 29):</strong> Read-only operations, safe package queries, or standard non-destructive builds.</li>
                                    <li><strong>MEDIUM (30 - 69):</strong> Dependency installations, state modifications, or non-main branch operations.</li>
                                    <li><strong>HIGH (70 - 89):</strong> Environment variable modifications, global installations, or branch resets.</li>
                                    <li><strong>CRITICAL (90 - 100):</strong> Force pushes to protected branches, recursive filesystem deletes, or known malicious CVEs.</li>
                                </ul>
                            </article>
                        )}

                        {activeDocId === "recommendations" && (
                            <article className="doc-article">
                                <h2>Recommendations Engine</h2>
                                <p className="lead-p">
                                    Instead of simply failing or blocking developer flows, OEI calculates safe alternatives and step-by-step remediation commands.
                                </p>
                                <h3>Example Remediations</h3>
                                <ul>
                                    <li><code>rm -rf node_modules &amp;&amp; npm install --force</code> → Suggests <code>npm ci</code> for clean, safe dependency sync.</li>
                                    <li><code>git push origin main --force</code> → Suggests creating a PR or pushing to a topic branch.</li>
                                </ul>
                            </article>
                        )}

                        {activeDocId === "api" && (
                            <article className="doc-article">
                                <h2>API Reference</h2>
                                <p className="lead-p">Integrate OEI analysis directly into your backend services and custom pipelines.</p>
                                <CodeSnippet
                                    header="TypeScript SDK"
                                    code={`import { analyzeCommand } from "@oei/core";

const result = await analyzeCommand({
  command: "npm install @solana/web3.js",
  cwd: process.cwd(),
});

console.log("Risk score:", result.riskScore);
console.log("Decision:", result.decision);`}
                                />
                            </article>
                        )}

                        {activeDocId === "mcp" && (
                            <article className="doc-article">
                                <h2>Model Context Protocol (MCP) Server</h2>
                                <p className="lead-p">
                                    OEI provides an official MCP server for AI coding assistants (Claude Desktop, Cursor, Windsurf).
                                </p>
                                <CodeSnippet
                                    header="claude_desktop_config.json"
                                    code={`{
  "mcpServers": {
    "oei": {
      "command": "npx",
      "args": ["-y", "@okelo0121/oei-cli", "mcp"]
    }
  }
}`}
                                />
                            </article>
                        )}

                        {activeDocId === "plugins" && (
                            <article className="doc-article">
                                <h2>Plugin Ecosystem</h2>
                                <p className="lead-p">
                                    Extend OEI with verified community analyzers for Docker, Terraform, Solana, and Kubernetes.
                                </p>
                                <CodeSnippet
                                    header="Install Plugin"
                                    code={`oei plugin add @oei/git-security
oei plugin add @oei/solana-verifier`}
                                />
                            </article>
                        )}

                        {activeDocId === "analyzers" && (
                            <article className="doc-article">
                                <h2>Building Custom Analyzers</h2>
                                <p className="lead-p">
                                    Create custom static analysis rules using TypeScript or YAML manifests.
                                </p>
                                <CodeSnippet
                                    header="rule.yaml"
                                    code={`id: "no-force-push-main"
severity: "HIGH"
match:
  commandPattern: "^git push.*--(force|f).*(main|master)"
analysis:
  message: "Force pushing to production branch is prohibited."
  recommendation: "Push to a feature branch and open a PR."`}
                                />
                            </article>
                        )}

                        {activeDocId === "integrations" && (
                            <article className="doc-article">
                                <h2>CI/CD &amp; Tool Integrations</h2>
                                <p className="lead-p">Automate execution safety checks in GitHub Actions, GitLab CI, and terminal pre-exec hooks.</p>
                                <CodeSnippet
                                    header=".github/workflows/oei-gate.yml"
                                    code={`name: OEI Safety Gate
on: [pull_request, push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx -y @okelo0121/oei-cli doctor`}
                                />
                            </article>
                        )}

                        {activeDocId === "config" && (
                            <article className="doc-article">
                                <h2>System Configuration</h2>
                                <p className="lead-p">Configuration is stored locally at <code>~/.oei/config.json</code>.</p>
                                <CodeSnippet
                                    header="Config CLI"
                                    code={`oei config list
oei config set AI_PROVIDER mock`}
                                />
                            </article>
                        )}

                        {activeDocId === "contributing" && (
                            <article className="doc-article">
                                <h2>Contributing to OEI</h2>
                                <p className="lead-p">
                                    OEI is 100% open-source under the MIT license. We welcome contributions for rule definitions, analyzers, documentation, and tooling.
                                </p>
                                <p>
                                    Check out our repository at <a href="https://github.com/okelo0121/OEI1" target="_blank" rel="noopener noreferrer" className="text-link">github.com/okelo0121/OEI1 →</a>.
                                </p>
                            </article>
                        )}

                        {activeDocId === "create-plugins" && (
                            <article className="doc-article">
                                <h2>Creating Plugins</h2>
                                <p className="lead-p">
                                    Package and publish custom analyzer rules to the decentralized OEI Registry.
                                </p>
                                <CodeSnippet
                                    header="Plugin Scaffolding"
                                    code={`oei plugin init my-security-plugin`}
                                />
                            </article>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
