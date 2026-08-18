import React, { useState } from "react";
import { CodeBlock } from "../components/ui/CodeBlock";
import { ExternalLink } from "../components/ui/ExternalLink";
import { SearchField } from "../components/ui/SearchField";
import { GITHUB_URL } from "../lib/constants";
import { PageProps } from "../lib/navigation";
import { includesIgnoreCase } from "../lib/text";

interface PluginItem {
    id: string;
    name: string;
    category: "Official" | "Community" | "Verified";
    description: string;
    author: string;
    version: string;
    status: string;
    downloads: string;
    installCmd: string;
    capabilities: string[];
    githubUrl: string;
}

const pluginList: PluginItem[] = [
    {
        id: "git-security",
        name: "@oei/git-security",
        category: "Official",
        description: "Catches destructive git commands (force pushes, hard resets) and credential leaks before pushing.",
        author: "OEI Core Team",
        version: "v1.4.0",
        status: "VERIFIED",
        downloads: "142K",
        installCmd: "oei plugin add @oei/git-security",
        capabilities: ["Force-push interception", "Secret scanning", "Branch protection"],
        githubUrl: GITHUB_URL,
    },
    {
        id: "solana-verifier",
        name: "@oei/solana-verifier",
        category: "Official",
        description: "Verifies cryptographic signatures against Solana on-chain registry for verified rule publishing.",
        author: "OEI & Solana Foundation",
        version: "v2.1.0",
        status: "VERIFIED",
        downloads: "98K",
        installCmd: "oei plugin add @oei/solana-verifier",
        capabilities: ["On-chain verification", "Ed25519 signatures", "Reputation check"],
        githubUrl: GITHUB_URL,
    },
    {
        id: "docker-inspect",
        name: "@oei/docker-inspect",
        category: "Official",
        description: "Analyzes container run commands, volume mounts, privileged flags, and base image vulnerabilities.",
        author: "OEI Core Team",
        version: "v1.2.1",
        status: "VERIFIED",
        downloads: "85K",
        installCmd: "oei plugin add @oei/docker-inspect",
        capabilities: ["Privileged container flag audit", "Host mount warning", "Root execution detection"],
        githubUrl: GITHUB_URL,
    },
    {
        id: "npm-audit-pro",
        name: "@oei/npm-audit-pro",
        category: "Community",
        description: "Inspects package dependency trees and lockfiles for typo-squatting and lifecycle scripts.",
        author: "Community (dev-sec)",
        version: "v0.9.4",
        status: "COMMUNITY",
        downloads: "45K",
        installCmd: "oei plugin add @oei/npm-audit-pro",
        capabilities: ["Typo-squatting detection", "Lifecycle script warning", "Peer dependency check"],
        githubUrl: GITHUB_URL,
    },
    {
        id: "python-bytecode",
        name: "@oei/python-bytecode",
        category: "Community",
        description: "Inspects PyPI wheels and setup.py files for obfuscated code execution and network sockets.",
        author: "PySec Labs",
        version: "v1.0.2",
        status: "COMMUNITY",
        downloads: "32K",
        installCmd: "oei plugin add @oei/python-bytecode",
        capabilities: ["Bytecode inspection", "Socket creation audit", "Setup.py parsing"],
        githubUrl: GITHUB_URL,
    },
    {
        id: "terraform-guard",
        name: "@oei/terraform-guard",
        category: "Verified",
        description: "Evaluates Terraform plan outputs to flag destructive database drops and public bucket changes.",
        author: "InfraGuard Team",
        version: "v1.1.0",
        status: "VERIFIED",
        downloads: "67K",
        installCmd: "oei plugin add @oei/terraform-guard",
        capabilities: ["Plan diff analysis", "S3 public read check", "DB deletion warning"],
        githubUrl: GITHUB_URL,
    },
];

export function PluginsPage({ onNavigate }: PageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [activePlugin, setActivePlugin] = useState<PluginItem | null>(null);

    const filteredPlugins = pluginList.filter((plugin) => {
        const matchesSearch =
            includesIgnoreCase(plugin.name, searchQuery) ||
            includesIgnoreCase(plugin.description, searchQuery);
        const matchesCat =
            selectedCategory === "All" || plugin.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="plugins-page">
            {/* Plugins Hero */}
            <section className="plugins-hero">
                <div className="plugins-hero-inner">
                    <div className="eyebrow">Plugin Ecosystem</div>
                    <h1>Extend OEI with intelligence.</h1>
                    <p>
                        Developers can build and install specialized analyzers for different tools, languages,
                        frameworks, and deployment pipelines.
                    </p>
                </div>

                {/* Primary Animated Ecosystem Diagram */}
                <div className="plugins-diagram-container">
                    <div className="diagram-title">Modular Plugin Integration Architecture</div>
                    <div className="plugin-nodes-diagram">
                        <div className="core-hub-node">
                            <span>OEI Core Protocol</span>
                            <small>Analysis Engine</small>
                        </div>

                        <div className="plugin-satellites">
                            <div className="satellite-node sat-git">
                                <strong>Git Analyzer</strong>
                                <small>@oei/git-security</small>
                                <span className="pulse-connector" />
                            </div>

                            <div className="satellite-node sat-solana">
                                <strong>Solana Verifier</strong>
                                <small>@oei/solana-verifier</small>
                                <span className="pulse-connector" />
                            </div>

                            <div className="satellite-node sat-docker">
                                <strong>Docker Inspect</strong>
                                <small>@oei/docker-inspect</small>
                                <span className="pulse-connector" />
                            </div>

                            <div className="satellite-node sat-npm">
                                <strong>npm Auditor</strong>
                                <small>@oei/npm-audit-pro</small>
                                <span className="pulse-connector" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plugin Discovery Section */}
            <section className="plugins-discovery">
                <div className="discovery-header">
                    <h2>Explore Analyzers &amp; Plugins</h2>

                    <div className="search-filter-bar">
                        <SearchField
                            className="plugin-search-input"
                            iconSize={16}
                            placeholder="Search plugins by name, framework, or keyword..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />

                        <div className="cat-pill-group">
                            {["All", "Official", "Verified", "Community"].map((cat) => (
                                <button
                                    key={cat}
                                    className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Plugin Grid */}
                <div className="plugin-grid">
                    {filteredPlugins.map((plugin) => (
                        <div
                            key={plugin.id}
                            className="plugin-card"
                            onClick={() => setActivePlugin(plugin)}
                        >
                            <div className="plugin-card-header">
                                <strong>{plugin.name}</strong>
                                <span className={`plugin-badge badge-${plugin.category.toLowerCase()}`}>
                                    {plugin.category}
                                </span>
                            </div>

                            <p>{plugin.description}</p>

                            <div className="plugin-card-meta">
                                <span>Author: {plugin.author}</span>
                                <span>{plugin.downloads} installs</span>
                            </div>

                            <div className="plugin-card-footer">
                                <span className="version-tag">{plugin.version}</span>
                                <button className="button button-light button-small">View Plugin →</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modal Detail Overlay for /plugins/[slug] */}
            {activePlugin && (
                <div className="plugin-modal-backdrop" onClick={() => setActivePlugin(null)}>
                    <div className="plugin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{activePlugin.name}</h2>
                                <span className="modal-author">Maintained by {activePlugin.author}</span>
                            </div>
                            <button className="modal-close-btn" onClick={() => setActivePlugin(null)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-desc">{activePlugin.description}</p>

                            <h4>Installation Command</h4>
                            <CodeBlock className="modal-code" code={activePlugin.installCmd} />

                            <h4>Capabilities</h4>
                            <ul className="caps-list">
                                {activePlugin.capabilities.map((cap, i) => (
                                    <li key={i}>✓ {cap}</li>
                                ))}
                            </ul>

                            <h4>Configuration Example (oei.config.yaml)</h4>
                            <CodeBlock className="modal-code" code={`plugins:
  - name: "${activePlugin.name}"
    version: "${activePlugin.version}"
    enabled: true
    settings:
      strictMode: true`} />

                            <div className="modal-actions">
                                <ExternalLink href={activePlugin.githubUrl} className="button button-dark">
                                    View Source on GitHub ↗
                                </ExternalLink>
                                <button onClick={() => setActivePlugin(null)} className="button button-light">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
