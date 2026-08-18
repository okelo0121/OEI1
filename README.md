# OEI — Open Execution Intelligence

> Transparent, execution-aware safety & risk intelligence protocol for developer terminals, CI/CD pipelines, and autonomous AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v1.4.0-black.svg)](https://oei.dev)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)](https://oei.dev)
[![Solana Registry](https://img.shields.io/badge/solana-verified_registry-purple.svg)](https://oei.dev/#registry)

---

## Overview

**OEI (Open Execution Intelligence)** is an open-source protocol and developer tool suite designed to analyze terminal commands, package installations, cloud deployments, and autonomous agent tool calls **before** execution.

Modern software engineering involves complex terminal operations, multi-tier dependency trees, container runtimes, and autonomous AI agents capable of invoking arbitrary shell commands. OEI sits transparently between human/AI intent and system execution—surfacing environment-aware risk, expected side effects, and actionable safe alternatives without blocking developer workflows.

---

## Key Features

- **Environment & Context Awareness**: Automatically discovers OS version, active Node/Python runtimes, git branch status, and package lockfiles to evaluate risk dynamically.
- **Solana On-Chain Trust Layer**: Cryptographically verifies rule packages and plugin signatures (`Ed25519`) against a decentralized registry on the Solana blockchain.
- **Model Context Protocol (MCP) Interceptor**: Seamlessly integrates into AI assistant workflows (Claude, Cursor, Windsurf, Antigravity) to analyze agent shell calls before execution.
- **Extensible Analyzer Plugins**: Supports modular analyzers such as `@oei/git-security`, `@oei/solana-verifier`, `@oei/docker-inspect`, and `@oei/npm-audit-pro`.
- **Developer-First Design Language**: Monochrome, high-contrast, technical aesthetic built for developer infrastructure tools.
- **100% Fully Responsive Platform**: Desktop and mobile UI covering documentation, API references, plugin registry, MCP server configurations, and community contribution guides.

---

## OEI Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Developer Action                      │
│      (CLI / IDE / CI Pipeline / Autonomous AI Agent)    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Environment Discovery                   │
│          (OS Runtimes, Git Context, Lockfiles)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   OEI Engine Pipeline                   │
│    +-----------------------+ +-----------------------+  │
│    | Static Analyzer Rules | | Solana Trust Verifier |  │
│    +-----------------------+ +-----------------------+  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Risk & Guidance Output                 │
│         (Severity, Side Effects, Recommendations)       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   You Stay in Control                   │
└─────────────────────────────────────────────────────────┘
```

---

## Quickstart

### 1. Install CLI Globally

```bash
# via npm
npm install -g @oei/cli

# via Homebrew (macOS / Linux)
brew install oei-protocol/tap/oei
```

### 2. Analyze a Command Before Execution

```bash
# Analyze a package installation
oei analyze "npm install @solana/web3.js"

# Analyze a destructive git operation
oei analyze "git push origin main --force"

# Display workspace context
oei context show
```

---

## Local Development Setup

To run the OEI web platform and documentation engine locally:

```bash
# 1. Clone the repository
git clone https://github.com/oei-protocol/oei.git
cd oei

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev

# 4. Build production bundle
npm run build
```

The web app will run locally at **`http://localhost:5173/`**.

### Running Tests

Unit tests use [Vitest](https://vitest.dev) with React Testing Library in a jsdom environment:

```bash
# Run the full suite once
npm test

# Watch mode during development
npm run test:watch

# Run with a coverage report (text + HTML in coverage/)
npm run test:coverage

# Type-check without emitting output
npm run typecheck
```

Tests live under `tests/`, mirroring the source layout (`tests/components/`, `tests/pages/`).

---

## Project Structure

```
OEI/
├── public/                 # Favicon & social card preview assets (OEI Logo Mark)
├── src/
│   ├── components/         # Navbar, Footer, and shared UI components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/              # Platform route components
│   │   ├── LandingPage.tsx # Main OEI landing page & interactive diagrams
│   │   ├── DocsPage.tsx    # Technical documentation & pipeline reference
│   │   ├── ApiPage.tsx     # REST API schemas & SDK code explorer
│   │   ├── PluginsPage.tsx # Plugin ecosystem directory & configuration modal
│   │   ├── McpPage.tsx     # Model Context Protocol agent interceptor guide
│   │   ├── CommunityPage.tsx # Open-source contribution guidelines
│   │   └── RegistryPage.tsx  # Solana on-chain trust registry
│   └── main.tsx            # Vite entry point
├── App.tsx                 # Route coordinator & layout wrapper
├── style.css               # Core design tokens, dark surfaces, & responsive rules
├── index.html              # HTML shell with favicon & OpenGraph social tags
├── package.json            # Scripts & project dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## API Reference Example

You can query the OEI analysis engine directly via HTTP:

```bash
curl -X POST https://api.oei.dev/v1/analyze \
  -H "Authorization: Bearer oei_sec_9f82a1..." \
  -H "Content-Type: application/json" \
  -d '{
    "command": "npm install @solana/web3.js",
    "environment": {
      "os": "macOS 14.4",
      "nodeVersion": "20.11.1"
    }
  }'
```

### Sample Response (200 OK)

```json
{
  "status": "success",
  "analysisId": "an_98f12a8b",
  "riskLevel": "LOW",
  "score": 0.08,
  "command": "npm install @solana/web3.js",
  "findings": [
    {
      "category": "Impact",
      "value": "Installs 1 new dependency to package.json.",
      "status": "EXPECTED"
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
    "signer": "SolanaRegistry:Author_8f1a"
  }
}
```

---

## Contributing

We welcome contributions from developers, security researchers, and AI agent builders!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/analyzer-name`)
3. Commit your changes (`git commit -m 'Add new Docker analyzer'`)
4. Push to the branch (`git push origin feature/analyzer-name`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

© 2026 OEI Protocol.
