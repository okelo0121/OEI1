import React from "react";

interface McpPageProps {
    onNavigate: (route: string) => void;
}

export function McpPage({ onNavigate }: McpPageProps) {
    return (
        <div className="mcp-page">
            {/* MCP Hero */}
            <section className="mcp-hero">
                <div className="mcp-hero-inner">
                    <div className="eyebrow">Model Context Protocol</div>
                    <h1>Give AI agents execution intelligence.</h1>
                    <p>
                        OEI implements the Model Context Protocol (MCP) to provide AI coding assistants
                        (Claude, Cursor, Windsurf) with real-time environment context, risk assessment, and safe alternatives.
                    </p>
                </div>

                {/* Primary Animated Diagram: AI Agent -> MCP Server -> OEI -> Recommendation */}
                <div className="mcp-diagram-container">
                    <div className="diagram-title">OEI + MCP Agent Loop</div>
                    <div className="mcp-flow-diagram">
                        <div className="mcp-node mcp-node-agent">
                            <span className="mcp-tag">01</span>
                            <strong>AI Agent</strong>
                            <small>Claude / Cursor / Agent</small>
                        </div>

                        <div className="mcp-arrow mcp-arrow-1">
                            <div className="mcp-packet" />
                            <svg width="40" height="12" viewBox="0 0 40 12">
                                <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                <polygon points="30,3 38,6 30,9" fill="#888888" />
                            </svg>
                        </div>

                        <div className="mcp-node mcp-node-server">
                            <span className="mcp-tag">02</span>
                            <strong>MCP Server</strong>
                            <small>@oei/mcp-server</small>
                        </div>

                        <div className="mcp-arrow mcp-arrow-2">
                            <div className="mcp-packet" />
                            <svg width="40" height="12" viewBox="0 0 40 12">
                                <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                <polygon points="30,3 38,6 30,9" fill="#888888" />
                            </svg>
                        </div>

                        <div className="mcp-node mcp-node-oei">
                            <span className="mcp-tag mcp-tag-dark">03</span>
                            <strong>OEI Engine</strong>
                            <small>Context &amp; Risk Check</small>
                        </div>

                        <div className="mcp-arrow mcp-arrow-3">
                            <div className="mcp-packet" />
                            <svg width="40" height="12" viewBox="0 0 40 12">
                                <line x1="0" y1="6" x2="32" y2="6" stroke="#aaaaaa" strokeWidth="1.5" strokeDasharray="4 4" />
                                <polygon points="30,3 38,6 30,9" fill="#888888" />
                            </svg>
                        </div>

                        <div className="mcp-node mcp-node-rec">
                            <span className="mcp-tag">04</span>
                            <strong>Recommendation</strong>
                            <small>Safe Execution Path</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* MCP Overview & Features */}
            <section className="mcp-content-section">
                <div className="mcp-grid-3">
                    <div className="mcp-feature-card">
                        <h3>1. Environment Inspection</h3>
                        <p>
                            AI agents frequently hallucinate paths or try running Linux commands on Windows.
                            OEI MCP exposes actual OS, shell, and installed dependency contexts.
                        </p>
                    </div>

                    <div className="mcp-feature-card">
                        <h3>2. Risk Analysis Tool</h3>
                        <p>
                            Before executing shell commands or modifying lockfiles, agents invoke
                            <code>oei_analyze_command</code> to detect destructive force pushes or file wipes.
                        </p>
                    </div>

                    <div className="mcp-feature-card">
                        <h3>3. On-Chain Verifier</h3>
                        <p>
                            AI agents verify plugin cryptographic signatures via the Solana registry,
                            ensuring third-party rules are authentic.
                        </p>
                    </div>
                </div>

                {/* Available Tools */}
                <div className="mcp-tools-container">
                    <h2>Available MCP Tools</h2>

                    <div className="mcp-tool-list">
                        <div className="mcp-tool-row">
                            <code>oei_analyze_command(command, cwd)</code>
                            <span>Analyzes a bash or terminal command against environment context and returns risk rating.</span>
                        </div>

                        <div className="mcp-tool-row">
                            <code>oei_inspect_environment()</code>
                            <span>Returns system metadata including OS, Node version, Python, git branch, and lockfile state.</span>
                        </div>

                        <div className="mcp-tool-row">
                            <code>oei_verify_signature(plugin_name)</code>
                            <span>Checks cryptographic signature against Solana registry to ensure plugin integrity.</span>
                        </div>
                    </div>
                </div>

                {/* MCP Configuration */}
                <div className="mcp-config-container">
                    <h2>Configuring MCP for Claude &amp; Cursor</h2>

                    <div className="config-snippet-group">
                        <div className="config-header">claude_desktop_config.json</div>
                        <pre className="mcp-code-block">
                            <code>{`{
  "mcpServers": {
    "oei": {
      "command": "npx",
      "args": ["-y", "@oei/mcp-server"],
      "env": {
        "OEI_STRICT_MODE": "true"
      }
    }
  }
}`}</code>
                        </pre>
                    </div>
                </div>

                {/* Example Workflow */}
                <div className="mcp-workflow-example">
                    <h2>Example Agent Workflow Intervention</h2>

                    <div className="chat-demo">
                        <div className="chat-msg msg-user">
                            <strong>User:</strong> Clean up build artifacts and force update dependencies.
                        </div>

                        <div className="chat-msg msg-agent">
                            <strong>AI Agent:</strong> I will run <code>rm -rf node_modules package-lock.json &amp;&amp; npm install --force</code>.
                        </div>

                        <div className="chat-msg msg-oei">
                            <strong>OEI Interception:</strong>
                            <div className="oei-intercept-box">
                                <span className="intercept-title">⚠ HIGH RISK DETECTED by OEI</span>
                                <p>
                                    <code>rm -rf node_modules</code> is destroying local native build bindings.
                                    Target branch is <strong>main</strong>.
                                </p>
                                <strong>Recommendation: Use <code>npm ci</code> for clean, safe dependency sync.</strong>
                            </div>
                        </div>

                        <div className="chat-msg msg-agent">
                            <strong>AI Agent (Updated):</strong> Thanks! Running <code>npm ci</code> instead to safely sync dependencies.
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
