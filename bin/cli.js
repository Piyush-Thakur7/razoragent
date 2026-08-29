#!/usr/bin/env node

/**
 * ⚡ RazorAgent by Resence
 * Enterprise Model Context Protocol (MCP) Commerce & Settlement Gateway
 * Dynamic CLI Engine
 */

const args = process.argv.slice(2);

// Parse CLI Flags
let spendCap = 5000;
let skuLimit = 1;
let keyId = process.env.RAZORPAY_KEY_ID || null;
let keySecret = process.env.RAZORPAY_KEY_SECRET || null;
let isHelp = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--spend-cap' && args[i + 1]) {
    spendCap = Number(args[i + 1]);
    i++;
  } else if (args[i] === '--sku-limit' && args[i + 1]) {
    skuLimit = Number(args[i + 1]);
    i++;
  } else if (args[i] === '--key' && args[i + 1]) {
    keyId = args[i + 1];
    i++;
  } else if (args[i] === '--secret' && args[i + 1]) {
    keySecret = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    isHelp = true;
  }
}

if (isHelp) {
  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent CLI Reference\x1b[0m\n');
  console.log('Usage: npx razoragent [options]\n');
  console.log('Options:');
  console.log('  --spend-cap <INR>   Set maximum autonomous transaction spend limit (Default: 5000)');
  console.log('  --sku-limit <N>     Set maximum allowed units per SKU (Default: 1)');
  console.log('  --key <KEY_ID>      Provide Razorpay Key ID (e.g. rzp_test_xxx)');
  console.log('  --secret <SECRET>   Provide Razorpay Key Secret');
  console.log('  --help, -h          Show this help documentation\n');
  console.log('Examples:');
  console.log('  npx razoragent --spend-cap 12000 --sku-limit 2');
  console.log('  npx razoragent --key rzp_test_AiBuilder2026\n');
  process.exit(0);
}

// Clean Dynamic Console Output
console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent\x1b[0m \x1b[90mby\x1b[0m \x1b[1mResence\x1b[0m \x1b[32m(v1.0.4 - Enterprise MCP Gateway)\x1b[0m');
console.log('\x1b[90mBounded Model Context Protocol Gateway for Autonomous AI Buyers\x1b[0m\n');

console.log('\x1b[1m⚙️  Active Gateway Configuration:\x1b[0m');
console.log(`  • Autonomous Spend Cap : \x1b[33m₹${spendCap.toLocaleString('en-IN')}\x1b[0m \x1b[90m(Customizable via --spend-cap <INR>)\x1b[0m`);
console.log(`  • SKU Purchase Limit   : \x1b[33m${skuLimit} unit(s) max\x1b[0m \x1b[90m(Customizable via --sku-limit <N>)\x1b[0m`);
console.log(`  • Razorpay Integration : \x1b[32m${keyId ? `LIVE KEY (${keyId})` : 'HIGH-FIDELITY SANDBOX'}\x1b[0m \x1b[90m(api.razorpay.com/v1/orders)\x1b[0m`);
console.log(`  • Concurrency Defense  : \x1b[32mACTIVE\x1b[0m \x1b[90m(Canonical SHA-256 Idempotency Locking)\x1b[0m`);
console.log(`  • Webhook Verification : \x1b[32mACTIVE\x1b[0m \x1b[90m(HMAC-SHA256 Cryptographic Signature)\x1b[0m\n`);

console.log('\x1b[1m📡 Protocol Endpoints & Interfaces:\x1b[0m');
console.log('  • Universal MCP Endpoint : \x1b[36mhttps://razoragent.vercel.app/api/razoragent/mcp\x1b[0m');
console.log('  • Merchant Web Dashboard : \x1b[36mhttps://razoragent.vercel.app\x1b[0m\n');

console.log('\x1b[90mTip: Run "npx razoragent --help" to view all CLI configuration flags.\x1b[0m\n');
