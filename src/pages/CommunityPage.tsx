import React from "react";
import { DashedArrow } from "../components/ui/DashedArrow";
import { CodeBlock } from "../components/ui/CodeBlock";
import { ExternalLink } from "../components/ui/ExternalLink";
import { GITHUB_URL } from "../lib/constants";
import { PageProps } from "../lib/navigation";

export function CommunityPage({ onNavigate }: PageProps) {
    return (
        <div className="community-page">
            {/* Community Hero */}
            <section className="community-hero">
                <div className="community-hero-inner">
                    <div className="eyebrow">Open Community</div>
                    <h1>Build the intelligence layer together.</h1>
                    <p>
                        OEI is designed as a community-driven protocol. Anyone can build analyzers, rule definitions,
                        IDE plugins, and documentation to protect developers worldwide.
                    </p>
                </div>

                {/* Primary Animated Diagram */}
                <div className="community-diagram-container">
                    <div className="diagram-title">Open Contribution &amp; Feedback Loop</div>
                    <div className="comm-flow-diagram">
                        <div className="comm-node comm-node-1">
                            <strong>Community</strong>
                            <small>Contributors &amp; Devs</small>
                        </div>

                        <div className="comm-arrow comm-arrow-1">
                            <div className="comm-dot" />
                            <DashedArrow />
                        </div>

                        <div className="comm-node comm-node-2">
                            <strong>Analyzers &amp; Rules</strong>
                            <small>Open Source Rules</small>
                        </div>

                        <div className="comm-arrow comm-arrow-2">
                            <div className="comm-dot" />
                            <DashedArrow />
                        </div>

                        <div className="comm-node comm-node-3">
                            <strong>OEI Ecosystem</strong>
                            <small>Verified Registry</small>
                        </div>

                        <div className="comm-arrow comm-arrow-3">
                            <div className="comm-dot" />
                            <DashedArrow />
                        </div>

                        <div className="comm-node comm-node-4">
                            <strong>Developers &amp; AI Agents</strong>
                            <small>Safer Execution</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ways to Contribute */}
            <section className="community-content-section">
                <h2>Ways to Contribute</h2>

                <div className="ways-grid">
                    <div className="way-card">
                        <div className="way-number">01</div>
                        <h3>Build an Analyzer</h3>
                        <p>Write custom static analysis rules for language ecosystems, framework conventions, or cloud CLIs.</p>
                        <code>oei analyzer init my-rule</code>
                    </div>

                    <div className="way-card">
                        <div className="way-number">02</div>
                        <h3>Improve Documentation</h3>
                        <p>Help clarify CLI usage, create example configurations, or translate guides for international developers.</p>
                        <ExternalLink href={GITHUB_URL} className="text-link">Docs Repo →</ExternalLink>
                    </div>

                    <div className="way-card">
                        <div className="way-number">03</div>
                        <h3>Build Tool Integrations</h3>
                        <p>Create plugins for IDEs, CI/CD runners, terminal prompt managers, or custom AI agent frameworks.</p>
                        <button onClick={() => onNavigate("/plugins")} className="text-link">Plugin Specs →</button>
                    </div>

                    <div className="way-card">
                        <div className="way-number">04</div>
                        <h3>Report &amp; Verify Issues</h3>
                        <p>Submit bug reports, propose security RFCs, or participate in open protocol discussions.</p>
                        <ExternalLink href={GITHUB_URL} className="text-link">GitHub Discussions →</ExternalLink>
                    </div>
                </div>

                {/* Quickstart for Rule Authors */}
                <div className="rule-author-quickstart">
                    <h2>Creating Your First Rule</h2>
                    <p>Rules are defined in simple YAML or TypeScript manifests:</p>

                    <CodeBlock className="comm-code-block" code={`# my-rule.yaml
id: "no-force-push-main"
severity: "HIGH"
match:
  commandPattern: "^git push.*--(force|f).*(main|master)"
analysis:
  message: "Force pushing to primary production branch is blocked by OEI policy."
  recommendation: "Use feature branch PR or run git push without --force."`} />
                </div>
            </section>
        </div>
    );
}
