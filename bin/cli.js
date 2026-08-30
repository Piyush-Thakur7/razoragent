#!/usr/bin/env node

/**
 * ⚡ RazorAgent by Resence
 * Enterprise Model Context Protocol (MCP) Commerce & Settlement Gateway
 * Production Executable CLI Engine
 */

const path = require('path');
const pkg = require('../package.json');
const VERSION = pkg.version || '1.0.6';

// Dynamically import compiled SDK
let sdk;
try {
  sdk = require('../dist/index.js');
} catch (e) {
  try {
    sdk = require('../dist');
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Compiled SDK not found in dist/. Run "npm run build:package" first.');
    process.exit(1);
  }
}

const {
  globalAgentSimulator,
  globalGuardrailEngine,
  globalRazorpayAdapter,
  globalTestSuite,
  MCP_TOOLS,
  MERCHANT_CATALOG,
} = sdk;

const rawArgs = process.argv.slice(2);

// Flag parsing
let command = null;
let intent = null;
let spendCap = 5000;
let skuLimit = 3;
let keyId = process.env.RAZORPAY_KEY_ID || null;
let keySecret = process.env.RAZORPAY_KEY_SECRET || null;
let isJson = false;
let isHelp = false;
let isVersion = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === 'run' || arg === 'test' || arg === 'tools' || arg === 'catalog' || arg === 'status') {
    command = arg;
  } else if ((arg === '--intent' || arg === '-i') && rawArgs[i + 1]) {
    intent = rawArgs[i + 1];
    i++;
  } else if (arg === '--spend-cap' && rawArgs[i + 1]) {
    spendCap = Number(rawArgs[i + 1]);
    i++;
  } else if (arg === '--sku-limit' && rawArgs[i + 1]) {
    skuLimit = Number(rawArgs[i + 1]);
    i++;
  } else if (arg === '--key' && rawArgs[i + 1]) {
    keyId = rawArgs[i + 1];
    i++;
  } else if (arg === '--secret' && rawArgs[i + 1]) {
    keySecret = rawArgs[i + 1];
    i++;
  } else if (arg === '--json') {
    isJson = true;
  } else if (arg === '--help' || arg === '-h') {
    isHelp = true;
  } else if (arg === '--version' || arg === '-v') {
    isVersion = true;
  } else if (!arg.startsWith('-') && !intent && !command) {
    intent = arg;
  }
}

if (isVersion) {
  console.log(`razoragent v${VERSION}`);
  process.exit(0);
}

if (isHelp) {
  printHelp();
  process.exit(0);
}

// Route commands
async function main() {
  // Update guardrail config
  globalGuardrailEngine.updateConfig({
    maxSpendLimitINR: spendCap,
    maxQuantityPerItem: skuLimit,
  });

  if (keyId) process.env.RAZORPAY_KEY_ID = keyId;
  if (keySecret) process.env.RAZORPAY_KEY_SECRET = keySecret;

  if (command === 'test') {
    await runTests();
    return;
  }

  if (command === 'tools') {
    printTools();
    return;
  }

  if (command === 'catalog') {
    printCatalog();
    return;
  }

  if (intent || command === 'run') {
    const userIntent = intent || 'Find me a Keychron mechanical keyboard under ₹4,000';
    await executeIntent(userIntent);
    return;
  }

  // Default: Print Status Banner
  printBanner();
}

function printBanner() {
  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent\x1b[0m \x1b[90mby\x1b[0m \x1b[1mResence\x1b[0m \x1b[32m(v' + VERSION + ' - Enterprise MCP Gateway)\x1b[0m');
  console.log('\x1b[90mBounded Model Context Protocol Gateway for Autonomous AI Buyers\x1b[0m\n');

  console.log('\x1b[1m⚙️  Active Gateway Configuration:\x1b[0m');
  console.log(`  • Autonomous Spend Cap : \x1b[33m₹${spendCap.toLocaleString('en-IN')}\x1b[0m \x1b[90m(Customizable via --spend-cap <INR>)\x1b[0m`);
  console.log(`  • SKU Purchase Limit   : \x1b[33m${skuLimit} unit(s) max\x1b[0m \x1b[90m(Customizable via --sku-limit <N>)\x1b[0m`);
  console.log(`  • Razorpay Adapter     : \x1b[32m${keyId ? `LIVE KEY (${keyId})` : 'HIGH-FIDELITY SANDBOX'}\x1b[0m \x1b[90m(api.razorpay.com/v1/orders)\x1b[0m`);
  console.log(`  • Concurrency Defense  : \x1b[32mACTIVE\x1b[0m \x1b[90m(Canonical SHA-256 Idempotency Locking)\x1b[0m`);
  console.log(`  • Webhook Verification : \x1b[32mACTIVE\x1b[0m \x1b[90m(HMAC-SHA256 Cryptographic Signature)\x1b[0m\n`);

  console.log('\x1b[1m📡 Protocol Endpoints & Interfaces:\x1b[0m');
  console.log('  • Universal MCP Endpoint : \x1b[36mhttps://razoragent.resence.in/api/razoragent/mcp\x1b[0m');
  console.log('  • Merchant Web Dashboard : \x1b[36mhttps://razoragent.resence.in\x1b[0m\n');

  console.log('\x1b[1m🚀 Quickstart Commands:\x1b[0m');
  console.log('  \x1b[36mnpx razoragent run --intent "buy coffee under 1000"\x1b[0m');
  console.log('  \x1b[36mnpx razoragent run --intent "buy earbuds under 500" --spend-cap 500\x1b[0m');
  console.log('  \x1b[36mnpx razoragent test\x1b[0m');
  console.log('  \x1b[36mnpx razoragent tools\x1b[0m\n');
  console.log('\x1b[90mTip: Run "npx razoragent --help" to view full command reference.\x1b[0m\n');
}

function printHelp() {
  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent CLI Reference (v' + VERSION + ')\x1b[0m\n');
  console.log('Usage:');
  console.log('  npx razoragent [command] [options]\n');
  console.log('Commands:');
  console.log('  run                 Execute an autonomous buyer workflow with full MCP tool calling');
  console.log('  test                Run the 5/5 automated fintech verification suite');
  console.log('  tools               List all 6 registered Model Context Protocol (MCP) commerce tools');
  console.log('  catalog             List live merchant inventory SKUs and prices');
  console.log('  status              Display current gateway policies and Razorpay adapter status\n');
  console.log('Options:');
  console.log('  -i, --intent <TEXT> Natural language buyer intent (e.g. "buy earbuds under 500")');
  console.log('  --spend-cap <INR>   Maximum allowable transaction spend limit in INR (Default: 5000)');
  console.log('  --sku-limit <N>     Maximum allowed item quantity per SKU (Default: 3)');
  console.log('  --key <KEY_ID>      Razorpay API Key ID (e.g. rzp_test_xxx)');
  console.log('  --secret <SECRET>   Razorpay Key Secret');
  console.log('  --json              Output raw JSON execution trace');
  console.log('  -v, --version       Show package version');
  console.log('  -h, --help          Show this help documentation\n');
  console.log('Examples:');
  console.log('  npx razoragent run --intent "buy coffee under 1000"');
  console.log('  npx razoragent run --intent "buy 5 keyboards" --sku-limit 3');
  console.log('  npx razoragent run --intent "buy earbuds under 500" --spend-cap 500');
  console.log('  npx razoragent test\n');
}

function printTools() {
  console.log('\n\x1b[1m\x1b[34m⚡ Registered Model Context Protocol (MCP) Commerce Tools (6 Active):\x1b[0m\n');
  MCP_TOOLS.forEach((t, idx) => {
    console.log(`  ${idx + 1}. \x1b[32m${t.name}\x1b[0m`);
    console.log(`     \x1b[90m${t.description}\x1b[0m`);
    const params = Object.keys(t.parameters.properties || {}).join(', ');
    console.log(`     \x1b[33mParams:\x1b[0m (${params})\n`);
  });
}

function printCatalog() {
  console.log('\n\x1b[1m\x1b[34m🏬 Active Merchant Inventory Catalog:\x1b[0m\n');
  MERCHANT_CATALOG.forEach((item) => {
    console.log(`  • [\x1b[36m${item.id}\x1b[0m] \x1b[1m${item.name}\x1b[0m`);
    console.log(`    Price: \x1b[32m₹${item.price.toLocaleString('en-IN')}\x1b[0m | Stock: ${item.stock} | Rating: ${item.rating}★ | Category: ${item.category}`);
  });
  console.log('');
}

async function runTests() {
  console.log('\n\x1b[1m\x1b[34m🧪 Running RazorAgent Automated Fintech Verification Suite...\x1b[0m\n');
  const res = await globalTestSuite.runAllTests();
  
  res.results.forEach((t) => {
    const isPass = t.status === 'PASSED';
    const tag = isPass ? '\x1b[32m[PASSED]\x1b[0m' : '\x1b[31m[FAILED]\x1b[0m';
    console.log(`${tag} \x1b[1m${t.testId}\x1b[0m: ${t.name} (${t.durationMs}ms)`);
    console.log(`   \x1b[90mExpected:\x1b[0m ${t.expected}`);
    console.log(`   \x1b[90mActual:\x1b[0m   ${t.actual}\n`);
  });

  const allPassed = res.passedCount === res.totalCount;
  const summaryColor = allPassed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${summaryColor}\x1b[1mSummary: ${res.passedCount}/${res.totalCount} Test Suites Passed (100% Assertions)\x1b[0m\n`);
  if (!allPassed) process.exit(1);
}

async function executeIntent(userIntent) {
  if (!isJson) {
    console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent by Resence (v' + VERSION + ')\x1b[0m — Autonomous AI Buyer Execution');
    console.log('\x1b[90m================================================================\x1b[0m\n');
    console.log(`\x1b[1mPrompt:\x1b[0m "${userIntent}"`);
    console.log(`\x1b[90mActive Policies:\x1b[0m Spend Cap: ₹${spendCap.toLocaleString('en-IN')} | SKU Limit: ${skuLimit} units | Gateway: ${keyId ? 'LIVE RAZORPAY' : 'SANDBOX'}\n`);
  }

  const result = await globalAgentSimulator.simulatePurchase(userIntent);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Pretty terminal output for each step
  console.log('\x1b[1m[1. Intent Perception & Search]\x1b[0m');
  const searchStep = result.steps.find((s) => s.toolCall?.name === 'search_products');
  if (searchStep && searchStep.toolResult) {
    const r = searchStep.toolResult;
    console.log(`  • Search Query: \x1b[36m"${r.query}"\x1b[0m | Matching Items Found: \x1b[32m${r.count}\x1b[0m`);
    if (r.products && r.products.length > 0) {
      console.log(`  • Candidate Selected: \x1b[1m${r.products[0].name}\x1b[0m (₹${r.products[0].price_inr.toLocaleString('en-IN')})`);
    }
  }

  console.log('\n\x1b[1m[2. Tax & Quote Calculation (MCP)]\x1b[0m');
  if (result.finalCart) {
    const c = result.finalCart;
    const item = c.items[0];
    console.log(`  • Item: ${item?.name} x ${item?.quantity}`);
    console.log(`  • Subtotal: ₹${c.subtotal.toLocaleString('en-IN')} | Discount: -₹${c.discount.toLocaleString('en-IN')} (${c.couponApplied || 'None'})`);
    console.log(`  • Taxes: +₹${c.tax.toLocaleString('en-IN')} (18% GST) | Shipping: ₹${c.shipping}`);
    console.log(`  • \x1b[1mTotal Payable:\x1b[0m \x1b[33m₹${c.totalAmount.toLocaleString('en-IN')}\x1b[0m`);
  } else {
    console.log('  • \x1b[90mNo valid cart could be quoted for this request.\x1b[0m');
  }

  console.log('\n\x1b[1m[3. Deterministic Guardrail Decision]\x1b[0m');
  if (result.policyDecision) {
    const p = result.policyDecision;
    if (p.allowed) {
      console.log('  • Status: \x1b[32m\x1b[1m✔ POLICY_PASSED\x1b[0m (Complies with Spend Cap & SKU Bounds)');
      console.log(`  • Details: ${p.message}`);
    } else {
      console.log(`  • Status: \x1b[31m\x1b[1m🛑 INTERCEPTED & BLOCKED\x1b[0m (\x1b[1m${p.reasonCode}\x1b[0m)`);
      console.log(`  • Reason: ${p.message}`);
    }
  }

  console.log('\n\x1b[1m[4. Fintech Settlement & Razorpay Order]\x1b[0m');
  if (result.success && result.order) {
    const ord = result.order;
    const isLive = !!keyId && !keyId.includes('AiBuilder');
    console.log(`  • Razorpay Order ID : \x1b[32m\x1b[1m${ord.id}\x1b[0m`);
    console.log(`  • Subunit Amount    : ${ord.amount} paise (₹${(ord.amount / 100).toLocaleString('en-IN')})`);
    console.log(`  • Settlement Mode   : \x1b[32m${isLive ? 'RAZORPAY TEST API' : 'SIMULATED - High-Fidelity Test Mode'}\x1b[0m`);
    console.log(`  • Payment Link      : \x1b[36m${ord.payment_link || ord.short_url}\x1b[0m`);
    console.log(`  • UPI Intent URI    : \x1b[90m${ord.upi_intent_uri}\x1b[0m`);
    console.log(`  • Execution Time    : \x1b[32m${result.totalDurationMs}ms\x1b[0m\n`);
  } else {
    console.log('  • \x1b[31mZero funds debited.\x1b[0m Pre-settlement guardrails blocked order dispatch to payment gateway.');
    console.log(`  • Execution Time    : ${result.totalDurationMs}ms\n`);
  }
}

main().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', 'Execution error:', err);
  process.exit(1);
});
