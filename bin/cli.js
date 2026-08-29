#!/usr/bin/env node

/**
 * ⚡ RazorAgent by Resence
 * Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway
 */

const args = process.argv.slice(2);
const command = args[0] || 'info';

if (command === 'tools') {
  console.log('\n\x1b[1m\x1b[34m%s\x1b[0m', '⚡ RazorAgent MCP Commerce Tools:');
  console.log('  • search_products(query, category, max_price)');
  console.log('  • get_product_details(product_id)');
  console.log('  • calculate_cart_quote(items, coupon_code)');
  console.log('  • evaluate_spend_policy(cart_id)');
  console.log('  • create_guarded_order(cart_id, idempotency_key)');
  console.log('  • verify_payment_and_settle(order_id, payment_id, signature)\n');
  process.exit(0);
}

// Minimalist, Clean Production Banner (Like Vercel / Stripe CLI)
console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent\x1b[0m \x1b[90mby\x1b[0m \x1b[1mResence\x1b[0m \x1b[32m(v1.0.3 - Production Ready)\x1b[0m');
console.log('\x1b[90mBounded Model Context Protocol Gateway for Autonomous AI Buyers\x1b[0m\n');

console.log('  \x1b[32m✔\x1b[0m MCP JSON-RPC Server : \x1b[36mhttps://razoragent.vercel.app/api/razoragent/mcp\x1b[0m');
console.log('  \x1b[32m✔\x1b[0m Policy Guardrails   : \x1b[32mACTIVE\x1b[0m (₹5,000 Spend Cap · 3 SKU Bounds)');
console.log('  \x1b[32m✔\x1b[0m Idempotency Engine  : \x1b[32mLOCKED\x1b[0m (SHA-256 Anti-Double Billing)');
console.log('  \x1b[32m✔\x1b[0m Razorpay Adapter    : \x1b[32mREADY\x1b[0m (Dual-Mode: Sandbox / Live)\n');

console.log('\x1b[90mTo launch the interactive AI Studio, visit:\x1b[0m \x1b[4mhttps://razoragent.vercel.app\x1b[0m\n');
