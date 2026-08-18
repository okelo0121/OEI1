import React, { useState } from "react";
import { DashedArrow } from "../components/ui/DashedArrow";
import { CodeBlock } from "../components/ui/CodeBlock";
import { PageProps } from "../lib/navigation";

const sampleCode = {
    curl: `curl -X POST https://api.oei.dev/v1/analyze \\
  -H "Authorization: Bearer oei_sec_9f82a1..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "npm install @solana/web3.js",
    "environment": {
      "os": "macOS 14.4",
      "nodeVersion": "20.11.1",
      "packageManager": "npm"
    },
    "project": {
      "framework": "Next.js",
      "language": "TypeScript"
    }
  }'`,
    typescript: `import { OEIClient } from "@oei/sdk";

const oei = new OEIClient({ apiKey: process.env.OEI_API_KEY });

const result = await oei.analyze({
  command: "npm install @solana/web3.js",
  environment: {
    os: "macOS 14.4",
    nodeVersion: "20.11.1"
  }
});

console.log(result.riskLevel); // "LOW"
console.log(result.recommendations);`,
    python: `from oei import OEIClient

client = OEIClient(api_key="oei_sec_9f82a1...")

response = client.analyze(
    command="pip install torch --no-cache-dir",
    environment={"os": "Linux x86_64", "python": "3.11.4"}
)

print(response.risk_level)  # "LOW"
print(response.findings)`,
    go: `package main

import (
    "fmt"
    "github.com/oei-protocol/oei-go"
)

func main() {
    client := oei.NewClient("oei_sec_9f82a1...")
    res, err := client.Analyze(oei.AnalyzeRequest{
        Command: "git push origin main --force",
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(res.RiskLevel) // "HIGH"
}`,
};

const sampleResponse = `{
  "status": "success",
  "analysisId": "an_98f12a8b",
  "timestamp": "2025-08-07T14:00:00Z",
  "riskLevel": "LOW",
  "score": 0.08,
  "command": "npm install @solana/web3.js",
  "findings": [
    {
      "category": "Impact",
      "value": "Installs 1 new dependency to package.json.",
      "status": "EXPECTED"
    },
    {
      "category": "Network",
      "value": "Downloads packages from registry.npmjs.org.",
      "status": "REQUIRED"
    }
  ],
  "recommendations": [
    {
      "type": "SUGGESTION",
      "message": "Safe to proceed. Consider running npm audit after installation."
    }
  ],
  "signature": {
    "verified": true,
    "signer": "SolanaRegistry:Author_8f1a",
    "onChainTx": "5K9f...8a2b"
  }
}`;

const endpoints = [
    { id: "analyze", method: "POST", path: "/v1/analyze" },
    { id: "analyzers", method: "GET", path: "/v1/analyzers" },
    { id: "verify", method: "POST", path: "/v1/verify" },
    { id: "context", method: "GET", path: "/v1/context" },
];

const errorCodes = [
    {
        code: "400",
        title: "Bad Context Request",
        description: "The command or environment payload is missing required field properties.",
    },
    {
        code: "401",
        title: "Unauthorized",
        description: "Missing or invalid API secret token in Authorization header.",
    },
    {
        code: "422",
        title: "Rule Mismatch",
        description: "Specified analyzer plugin failed rule verification check.",
    },
    {
        code: "500",
        title: "Engine Timeout",
        description: "Static rule evaluation exceeded maximum processing deadline.",
    },
];

export function ApiPage({ onNavigate }: PageProps) {
    const [selectedTab, setSelectedTab] = useState<"curl" | "typescript" | "python" | "go">("curl");
    const [activeEndpoint, setActiveEndpoint] = useState<string>("analyze");

    return (
        <div className="api-page">
            {/* API Main Layout: Sidebar on Left, All Content on Right */}
            <section className="api-content-container">
                <div className="api-grid">
                    {/* Left: Endpoint Sidebar */}
                    <aside className="endpoint-sidebar">
                        <h3>Endpoints</h3>

                        <div className="endpoint-list">
                            {endpoints.map((endpoint) => (
                                <button
                                    key={endpoint.id}
                                    className={`endpoint-btn ${activeEndpoint === endpoint.id ? "active" : ""}`}
                                    onClick={() => setActiveEndpoint(endpoint.id)}
                                >
                                    <span className={`method-tag ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
                                    <span className="path-text">{endpoint.path}</span>
                                </button>
                            ))}
                        </div>

                        <div className="api-auth-box">
                            <h4>Authentication</h4>
                            <p>All API requests require a Bearer token header:</p>
                            <code>Authorization: Bearer oei_sec_...</code>
                        </div>
                    </aside>

                    {/* Right: API Header, Diagram, Code Explorer & Errors */}
                    <main className="api-main-area">
                        {/* API Header */}
                        <div className="docs-header">
                            <div className="eyebrow">API Reference</div>
                            <h1>Execution intelligence, through an API.</h1>
                            <p>
                                Applications, CI pipelines, and developer tools can send an action and its context
                                to OEI and receive structured risk analysis, impact metrics, and recommendations.
                            </p>
                        </div>

                        {/* Primary Animated Diagram: REQUEST -> OEI ENGINE -> RESPONSE */}
                        <div className="api-diagram-container">
                            <div className="diagram-title">API Request &amp; Response Flow</div>
                            <div className="api-flow-diagram">
                                <div className="api-node api-node-client">
                                    <span className="api-badge">Client App</span>
                                    <strong>POST /v1/analyze</strong>
                                    <small>JSON Request</small>
                                </div>

                                <div className="api-arrow-group api-arrow-req">
                                    <div className="api-dot-packet api-dot-request" />
                                    <DashedArrow size="lg" />
                                    <span className="arrow-label">payload</span>
                                </div>

                                <div className="api-node api-node-engine">
                                    <span className="api-badge api-badge-dark">OEI Engine</span>
                                    <strong>Analysis Core</strong>
                                    <small>Static &amp; Verified Rules</small>
                                </div>

                                <div className="api-arrow-group api-arrow-res">
                                    <div className="api-dot-packet api-dot-response" />
                                    <DashedArrow size="lg" />
                                    <span className="arrow-label">response</span>
                                </div>

                                <div className="api-node api-node-response">
                                    <span className="api-badge api-badge-success">200 OK</span>
                                    <strong>Risk Analysis</strong>
                                    <small>Risk, Findings, Signature</small>
                                </div>
                            </div>
                        </div>

                        {/* Code Explorer & Response */}
                        <div className="api-code-explorer">
                            <div className="code-tabs">
                                {(["curl", "typescript", "python", "go"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        className={`tab-btn ${selectedTab === tab ? "active" : ""}`}
                                        onClick={() => setSelectedTab(tab)}
                                    >
                                        {tab.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="code-block-wrapper">
                                <CodeBlock className="code-snippet" code={sampleCode[selectedTab]} />
                            </div>

                            <div className="response-preview-header">
                                <span>Response Schema (200 OK)</span>
                                <span className="status-pill">application/json</span>
                            </div>

                            <div className="code-block-wrapper response-block">
                                <CodeBlock className="code-snippet" code={sampleResponse} />
                            </div>
                        </div>

                        {/* HTTP Status & Error Handling */}
                        <div className="api-errors-section-inner">
                            <h2>HTTP Status &amp; Error Handling</h2>

                            <div className="error-grid">
                                {errorCodes.map((error) => (
                                    <div className="error-card" key={error.code}>
                                        <span className="error-code">{error.code}</span>
                                        <strong>{error.title}</strong>
                                        <p>{error.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </section>
        </div>
    );
}
