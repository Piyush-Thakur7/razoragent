# Contributing to RazorAgent

Thank you for your interest in contributing to **RazorAgent by Resence** — the Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway for Autonomous AI Buyers.

---

## 🚀 1. Local Development Setup

### Prerequisites
* **Node.js**: v18.17+ or v20+ recommended
* **NPM**: v9+
* **Git**

### Clone & Install
```bash
git clone https://github.com/Piyush-Thakur7/razoragent.git
cd razoragent

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the live Agent Terminal and Merchant Console.

---

## 🧪 2. Running Automated Tests

Before submitting any code changes, ensure all fintech and MCP test suites pass with 100% assertions:

```bash
# Run core fintech verification suite (Happy Path, Budget Guardrails, Idempotency, HMAC Webhooks)
npm run test:razoragent

# Run direct MCP JSON-RPC 2.0 protocol tests
npm run test:mcp

# Build the distributable TypeScript SDK package into dist/
npm run build:package
```

---

## 🏛️ 3. Architecture & Codebase Layout

* `lib/razoragent/`: Core MCP gateway, deterministic guardrails, SHA-256 idempotency locks, Razorpay adapter, and catalog data.
* `bin/cli.js`: Standalone executable command-line interface (`npx razoragent`).
* `app/`: Next.js Web App routes and API route handlers (`/api/razoragent/mcp`).
* `components/razoragent/`: UI Mission Control Dashboard, AI Buyer Terminal, Policy Inspector, and Webhook Stream.
* `dist/`: Compiled CommonJS and `.d.ts` type definitions for the public NPM library.

---

## 📋 4. Coding Standards & Guidelines

1. **Deterministic Guardrails**: Financial limit checks must never depend on non-deterministic LLM output. Always enforce mathematical limits in `guardrails.ts`.
2. **Zero-Dependency SDK**: The published runtime NPM package (`razoragent`) must remain zero-dependency. All UI frameworks (Next.js, React, Tailwind) belong in `devDependencies`.
3. **Cryptographic Integrity**: All webhook events and settlement signatures must use HMAC-SHA256 verification.
4. **Idempotency**: All payment-adjacent operations must utilize the SHA-256 idempotency latch to prevent concurrency retries.

---

## 🔄 5. Submitting Pull Requests

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(mcp): add support for multi-currency settlement"
   ```
3. Push to your branch and open a Pull Request against `main`.
4. Ensure the GitHub Actions CI workflow passes on your PR.

---

## 📄 License
By contributing to RazorAgent, you agree that your contributions will be licensed under the [MIT License](LICENSE).
