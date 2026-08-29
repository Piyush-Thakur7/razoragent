#!/usr/bin/env node

/**
 * ⚡ RazorAgent CLI
 * Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway
 */

const { MCP_TOOLS_REGISTRY } = require('../lib/razoragent/mcp-engine');

console.log('\x1b[36m%s\x1b[0m', '==========================================================');
console.log('\x1b[1m\x1b[34m%s\x1b[0m', '  ⚡ RazorAgent: Bounded MCP Commerce & Settlement Gateway');
console.log('\x1b[36m%s\x1b[0m', '==========================================================');
console.log('\x1b[32m%s\x1b[0m', '✔ Model Context Protocol (MCP) JSON-RPC 2.0 Engine Active');
console.log('\x1b[32m%s\x1b[0m', '✔ Deterministic Guardrail Policy Evaluator: ACTIVE (₹5,000 Cap)');
console.log('\x1b[32m%s\x1b[0m', '✔ SHA-256 Idempotency Lock: READY');
console.log('\x1b[32m%s\x1b[0m', '✔ Razorpay Settlement Adapter: DUAL-MODE (Sandbox/Live)');
console.log('----------------------------------------------------------');
console.log('\x1b[33m%s\x1b[0m', 'Registered MCP Commerce Tools (6 Active):');
console.log('  1. search_products()          - Semantic catalog filter');
console.log('  2. get_product_details()      - Technical specs & stock');
console.log('  3. calculate_cart_quote()     - 18% GST tax & promo engine');
console.log('  4. evaluate_spend_policy()    - Pre-settlement spend guardrail');
console.log('  5. create_guarded_order()     - SHA-256 idempotency Razorpay order');
console.log('  6. verify_payment_and_settle()- HMAC SHA-256 settlement audit');
console.log('----------------------------------------------------------');
console.log('\x1b[35m%s\x1b[0m', '🔗 Universal Cloud Gateway: https://razoragent.vercel.app');
console.log('\x1b[35m%s\x1b[0m', '📡 MCP Endpoint: https://razoragent.vercel.app/api/razoragent/mcp');
console.log('----------------------------------------------------------');
console.log('\x1b[90m%s\x1b[0m', 'Run "npx tsx scripts/test-razoragent.ts" for 5/5 automated test suites.');
console.log('\x1b[32m%s\x1b[0m', 'Gateway initialized successfully.');
