# ⚡ RazorAgent by Resence

> **Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway for Autonomous AI Buyers**  
> **Engineered by:** Resence · Piyush Singh  
> **Live Production Gateway:** [https://razoragent.resence.in](https://razoragent.resence.in)  
> **NPM Package Registry:** [https://www.npmjs.com/package/razoragent](https://www.npmjs.com/package/razoragent)  
> **MCP JSON-RPC Endpoint:** `https://razoragent.resence.in/api/razoragent/mcp`  
> **Install Command:** `npm install razoragent`

---

## 🎯 1. What RazorAgent Solves

Traditional e-commerce is built for **human eyes and fingers**—visual layouts, CSS styling, clickable DOM buttons, and human-in-the-loop OTP checkouts.

By 2026, commerce is transitioning to **Autonomous AI Agents** (OpenAI Operator, Claude Computer Use, Gemini Agentic Workflows, NPCI Unified Agent Protocol) researching and purchasing on behalf of consumers and enterprises.

However, letting AI agents interact directly with legacy checkout endpoints creates 4 critical failure modes:
1. **Financial Hallucinations**: LLMs generating fabricated price amounts or ordering invalid product variants.
2. **Double-Billing from Network Jitter**: AI agents retrying timed-out requests and triggering duplicate payment orders.
3. **Unbounded Spending**: No mathematical guarantee that an agent won't exceed user budgets or liquidate inventory.
4. **Lack of Standardized Tooling**: Fragile web scraping instead of structured tool interfaces.

**RazorAgent by Resence** bridges this gap. It turns any merchant catalog into a standardized **Model Context Protocol (MCP)** server, enabling AI shopping agents to discover products, compute tax-accurate quotes, and complete transactions through **Razorpay APIs**—backed by **deterministic mathematical guardrails** and **SHA-256 cryptographic idempotency locks**.

---

## 🏛️ 2. System Architecture & Universal MCP Availability

RazorAgent is an open, universally accessible gateway. Any AI agent (Claude Desktop, OpenAI Operator, Gemini CLI, Cursor, or custom Python agent) connects via standard **JSON-RPC 2.0**:

```mermaid
flowchart TD
    subgraph Client["🤖 Universal AI Buyer Clients"]
        Agent1["Claude Desktop / Anthropic SDK"]
        Agent2["OpenAI Operator / Function Calling"]
        Agent3["Gemini 2.0 / NPCI UAP Protocol"]
    end

    subgraph Gateway["🛡️ RazorAgent MCP & Policy Gateway (Next.js Edge)"]
        Agent1 & Agent2 & Agent3 -->|"JSON-RPC 2.0 (/api/razoragent/mcp)"| MCP["MCP Tool Dispatcher"]
        
        MCP --> Catalog["Catalog Search &\nFiltering Engine"]
        MCP --> Quoting["Tax & Promotion Engine\n(18% GST + Coupons)"]
        
        Quoting --> Guardrails{"Deterministic\nPolicy Engine"}
        
        Guardrails -->|"Budget / Qty / Category Check"| PolicyPassed["Policy Evaluated"]
        
        PolicyPassed -->|"Pass"| Idempotency["SHA-256 Idempotency Lock\n(Anti-Race Condition)"]
        PolicyPassed -->|"Fail"| Reject["Structured Error Response\n(BUDGET_EXCEEDED / QTY_LIMIT)"]
    end

    subgraph Settlement["💳 Razorpay Fintech Settlement"]
        Idempotency -->|"Deterministic Order Payload"| RzpAPI["Razorpay Orders API\n(Dual-Mode: Sandbox / Live)"]
        RzpAPI --> Order["Order ID (order_xxx)\n+ Standard Checkout Overlay"]
        Order --> Webhook["HMAC-SHA256\nWebhook Signature Verifier"]
    end

    subgraph Console["📊 Merchant Mission Control Dashboard"]
        RzpAPI --> Analytics["GMV Uplift & Analytics\n(Human vs. Agentic Split)"]
        Idempotency --> AuditTrail["Live Fintech Webhook Stream"]
        Catalog --> StockManager["Real-Time Inventory & Price Controls"]
    end
```

---

## 🛠️ 3. Standardized MCP Commerce Tools

RazorAgent exposes 6 standard Model Context Protocol tools via JSON-RPC 2.0 (`/api/razoragent/mcp`):

| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `search_products` | `query`, `category`, `max_price`, `min_rating` | Category-aware product search and filtering across merchant inventory. |
| `get_product_details` | `product_id` | Full technical specs, live inventory, and eligible coupon codes. |
| `calculate_cart_quote` | `items[]`, `coupon_code` | Computes subtotal, coupon discount, 18% GST tax, and shipping. |
| `evaluate_spend_policy` | `cart_id` | Deterministically validates compliance against merchant guardrails. |
| `create_guarded_order` | `cart_id`, `idempotency_key`, `buyer_email` | Creates verified Razorpay Order with SHA-256 race-condition locking. |
| `verify_payment_and_settle`| `order_id`, `payment_id`, `signature` | Cryptographic HMAC-SHA256 verification of payment completion. |

---

## ⚡ 4. High-Availability Engineering: The Concurrency Challenge

### The Problem: The LLM Non-Deterministic Retry Race Condition
During stress testing with concurrent autonomous shopping agents, simulated network jitter (1.5-second latency on order creation) triggered a critical issue:

The AI Buyer Agent assumed the request had timed out, hallucinatively mutated its nonce, and fired a concurrent retry of `create_guarded_order`. Because standard payment deduplication relied on client-supplied tokens, both requests reached the order creation pipeline 20 milliseconds apart, generating duplicate orders for a single cart.

### The Engineering Solution:

1. **Canonical SHA-256 Fingerprinting:** An immutable payload fingerprint:
```
Hash = SHA256(agent_id + canonical_sorted_cart_items + total_amount + time_window)
```

2. **Two-Phase Concurrency Latch:** In-memory promise locking with atomic state transitions:
```
INITIATED ───► LOCKED ───► ORDER_CREATED ───► CAPTURED
```
Any concurrent thread hitting the gateway while an order is in-flight is held on the same promise and receives the cached `order_xxx` ID without firing duplicate Razorpay API calls.

3. **Structured Semantic Interception Feedback:** Rather than returning a generic HTTP 409 conflict, the gateway returns `IDEMPOTENCY_RETRY_SUPPRESSED` with the active order receipt, allowing the agent to proceed to payment confirmation seamlessly.

*(You can verify this automatically via `npx tsx scripts/test-razoragent.ts` or the **"Run Tests"** button in the dashboard navbar!)*

---

## 🏬 5. How Merchants Deploy RazorAgent

```typescript
// Example: Exposing RazorAgent MCP tools on any Next.js / Express merchant backend
import { handleMCPRequest } from 'razoragent';

export async function POST(req: Request) {
  const jsonRpcBody = await req.json();
  const response = await handleMCPRequest(jsonRpcBody, {
    maxSpendLimitINR: 5000,
    allowedCategories: ['electronics', 'apparel', 'specialty-coffee'],
    maxQuantityPerItem: 3
  });
  return Response.json(response);
}
```

---

## 🧪 6. Automated Verification Suite (5/5 Passing)

RazorAgent includes automated system verification suites accessible via `npm run test:razoragent` or the **"Run Tests"** button on the web UI:

```bash
Running RazorAgent Automated Test Suite...

Summary: 5/5 passed (100% Assertion Rate)

[PASSED] TEST_01_HAPPY_PATH: Happy Path Autonomous Agent Checkout (93ms)
[PASSED] TEST_02_BUDGET_GUARDRAIL: Deterministic Budget Cap Enforcement (2ms)
[PASSED] TEST_03_QUANTITY_GUARDRAIL: SKU Hoarding & Quantity Bounds Enforcement (1ms)
[PASSED] TEST_04_2AM_RACE_CONDITION: Concurrency & Duplicate Retry Suppression (0ms)
[PASSED] TEST_05_HMAC_WEBHOOK_VERIFY: HMAC-SHA256 Cryptographic Webhook & Settlement Verifier (1ms)
```

---

## 🚀 7. Quick Start & Local Run

### Prerequisites
* Node.js 18+ / npm

### 1. Install via NPM
```bash
npm install razoragent
```

### 2. Or Clone the Repository
```bash
git clone https://github.com/Piyush-Thakur7/razoragent.git
cd razoragent
npm install
npm run dev
```

---

## 📄 License
MIT License © 2026 Resence. Open source.
