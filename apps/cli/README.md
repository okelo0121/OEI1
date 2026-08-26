# OEI CLI (`@okelo0121/oei-cli`)

Open Execution Intelligence (OEI) is an execution-aware developer safety protocol that parses, analyzes, scores risk, and enforces safety gates before developer commands execute.

## Installation

```bash
# Recommended global installation via npm
npm install -g @okelo0121/oei-cli

# via pnpm / yarn
pnpm add -g @okelo0121/oei-cli
yarn global add @okelo0121/oei-cli
```

### Troubleshooting: When and Why to Use `--force`

If you encounter errors or symlink conflicts during global installation:

```bash
npm install -g @okelo0121/oei-cli --force
```

**Reasons to use `--force`:**
1. **Existing Binary / Symlink Conflict (`EEXIST`)**: Overwrites stale `oei` binaries or prior local links in `/usr/local/bin` or `%APPDATA%\npm`.
2. **Peer Dependency Strictness (`ERESOLVE`)**: Bypasses strict peer dependency trees in npm 7+ when other global tools have conflicting dependencies.
3. **Cache Inconsistencies**: Forces npm to bypass cached partial packages and pull a fresh bundle from npm.

## System Diagnostic Verification

Verify installation health, local system environment, and developer tools:

```bash
oei doctor
```

## Usage & Commands

### 1. `oei analyze "<command>"`
Analyze a developer command against the OEI Knowledge & Risk Engine without executing it.

> **Safety Guarantee**: `oei analyze` is strictly analysis-only and **NEVER** executes any requested process.

```bash
oei analyze "npm install express"
oei analyze "git push origin main --force"
oei analyze "solana program deploy target/deploy/app.so"
```

### 2. `oei exec "<command>"`
Evaluate a command through the OEI Execution Gate and conditionally execute it.

```bash
oei exec "node --version"
oei exec "npm install express"
oei exec "solana program deploy app.so" --dry-run
```

### 3. `oei context`
Inspect workspace runtime environment, operating system, and Git repository state safely.

```bash
oei context
```

### 4. `oei config`
Manage OEI system and AI provider configuration settings persisted at `~/.oei/config.json`.

```bash
oei config list
oei config get AI_PROVIDER
oei config set AI_PROVIDER mock
```

### 5. `oei knowledge`
Inspect registered knowledge sources and query official advisories.

```bash
oei knowledge sources
oei knowledge search "Solana"
```

## Safety & Execution Security Model

- **Analysis Non-Execution**: `oei analyze` never spawns child processes.
- **Strict Gate Policy**:
  - `ALLOW` / `SUGGESTION`: Executes automatically (with suggestion banner).
  - `WARN`: Requires developer confirmation `[y/N]` (default `N` in non-interactive environments).
  - `BLOCK`: Exits with code `2` and **NEVER** executes.
- **No BLOCK Bypasses**: Passing `--yes` / `-y` on a `BLOCK` decision will **NEVER** bypass policy.
- **Shell Injection Protection**: Complex shell operators (`&&`, `||`, `;`, `>`, `>>`, `|`, `<`, `$()`, `` ` ``) are safely intercepted and rejected with exit code `5`.
- **Zero Secret Exposure**: Passwords, tokens, API keys, and environment variables are protected via `SafetyGuard` and strictly excluded from logs, outputs, and AI reasoning boundaries.
- **Offline AI Boundary**: Operates 100% offline by default using `AI_PROVIDER=mock`. AI only provides explanation summaries and never alters deterministic risk scores or execution permissions.

## Exit Codes

- `0`: Success (executed process exited 0, or dry-run complete)
- `1`: Executed process exited non-zero / missing argument / invalid config
- `2`: Command blocked by OEI Security Policy (`BLOCK`)
- `3`: User declined confirmation prompt (`WARN` -> `n`)
- `4`: Internal gate or analysis error
- `5`: Unsupported / unsafe shell expression
