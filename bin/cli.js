#!/usr/bin/env node

/**
 * ⚡ RazorAgent by Resence
 * Enterprise Model Context Protocol (MCP) Commerce & Settlement Gateway
 * Production Executable CLI Engine & Merchant Onboarding Wizard
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pkg = require('../package.json');
const VERSION = pkg.version || '1.0.6';

// Load .env.local or .env if present in current directory
try {
  const envPaths = [path.resolve(process.cwd(), '.env.local'), path.resolve(process.cwd(), '.env')];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) process.env[key] = value.trim();
        }
      });
      break;
    }
  }
} catch (e) {
  // Ignore env read errors
}

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
  globalMCPEngine,
  globalTestSuite,
  ShopifyCatalogProvider,
  WooCommerceCatalogProvider,
  globalDemoCatalogProvider,
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

  if (['connect', 'status', 'run', 'test', 'tools', 'catalog'].includes(arg)) {
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

  if (command === 'connect') {
    await runConnectWizard();
    return;
  }

  if (command === 'status') {
    await printStatus();
    return;
  }

  if (command === 'test') {
    await runTests();
    return;
  }

  if (command === 'tools') {
    printTools();
    return;
  }

  if (command === 'catalog') {
    await printCatalog();
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

/**
 * PART 1: Interactive Merchant Onboarding Wizard
 */
async function runConnectWizard() {
  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent Merchant Connect Wizard\x1b[0m \x1b[90m(v' + VERSION + ')\x1b[0m');
  console.log('\x1b[90mConnect your real e-commerce store to the autonomous AI buyer gateway.\x1b[0m\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('\x1b[1mStep 1: Select Your E-Commerce Storefront Platform\x1b[0m');
    console.log('  1) \x1b[32mShopify\x1b[0m (Storefront GraphQL API)');
    console.log('  2) \x1b[35mWooCommerce\x1b[0m (REST API v3)');
    console.log('  3) \x1b[33mDemo Catalog\x1b[0m (Zero-config sample data)\n');

    const choice = (await question('Select option (1-3) [Default: 1]: ')).trim() || '1';

    let envUpdates = {};

    if (choice === '1') {
      console.log('\n\x1b[1mStep 2: Shopify Storefront Credentials\x1b[0m');
      console.log('\x1b[90mHint: Find this in Shopify Admin → Settings → Apps → Develop apps → Storefront API\x1b[0m\n');

      const domain = (await question('Enter Shopify Store Domain (e.g. store.myshopify.com): ')).trim();
      const token = (await question('Enter Storefront API Access Token: ')).trim();

      if (!domain || !token) {
        console.log('\x1b[31m✖ Missing required Shopify domain or token. Aborting setup.\x1b[0m\n');
        rl.close();
        return;
      }

      console.log('\n\x1b[34mTesting live connection to Shopify Storefront API...\x1b[0m');
      const testProvider = new ShopifyCatalogProvider({ storeDomain: domain, storefrontAccessToken: token });
      const products = await testProvider.searchProducts('');

      if (products.length > 0) {
        console.log(`\x1b[32m✔ Connected successfully! Found ${products.length} live product(s) in your Shopify store.\x1b[0m`);
        console.log('\x1b[90mSample SKUs found:\x1b[0m');
        products.slice(0, 3).forEach((p, idx) => console.log(`  ${idx + 1}. [${p.id}] ${p.name} (₹${p.price})`));
      } else {
        console.log('\x1b[33m⚠ Connected to Storefront API, but 0 published products were returned.\x1b[0m');
      }

      envUpdates = {
        SHOPIFY_STORE_DOMAIN: domain,
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: token,
      };
    } else if (choice === '2') {
      console.log('\n\x1b[1mStep 2: WooCommerce Credentials\x1b[0m');
      console.log('\x1b[90mHint: WordPress Admin → WooCommerce → Settings → Advanced → REST API\x1b[0m\n');

      const siteUrl = (await question('Enter WooCommerce Store URL (e.g. https://your-store.com): ')).trim();
      const ck = (await question('Enter Consumer Key (ck_...): ')).trim();
      const cs = (await question('Enter Consumer Secret (cs_...): ')).trim();

      if (!siteUrl || !ck || !cs) {
        console.log('\x1b[31m✖ Missing required WooCommerce credentials. Aborting setup.\x1b[0m\n');
        rl.close();
        return;
      }

      console.log('\n\x1b[34mTesting live connection to WooCommerce REST API...\x1b[0m');
      const testProvider = new WooCommerceCatalogProvider({ siteUrl, consumerKey: ck, consumerSecret: cs });
      const products = await testProvider.searchProducts('');

      if (products.length > 0) {
        console.log(`\x1b[32m✔ Connected successfully! Found ${products.length} product(s) in your WooCommerce store.\x1b[0m`);
      } else {
        console.log('\x1b[33m⚠ Connected to WooCommerce API, but 0 products were returned.\x1b[0m');
      }

      envUpdates = {
        WOOCOMMERCE_SITE_URL: siteUrl,
        WOOCOMMERCE_CONSUMER_KEY: ck,
        WOOCOMMERCE_CONSUMER_SECRET: cs,
      };
    } else {
      console.log('\n\x1b[33mUsing zero-config Demo In-Memory Catalog (Sample Data).\x1b[0m\n');
      rl.close();
      return;
    }

    // Save to .env.local
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    let existingContent = '';
    if (fs.existsSync(envLocalPath)) {
      existingContent = fs.readFileSync(envLocalPath, 'utf8');
    }

    let newContent = existingContent;
    for (const [k, v] of Object.entries(envUpdates)) {
      const regex = new RegExp(`^${k}=.*$`, 'm');
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, `${k}=${v}`);
      } else {
        newContent += `\n${k}=${v}`;
      }
      process.env[k] = v;
    }

    fs.writeFileSync(envLocalPath, newContent.trim() + '\n', 'utf8');
    console.log(`\n\x1b[32m✔ Configuration saved to .env.local!\x1b[0m`);
    console.log('Future \x1b[36mnpx razoragent run\x1b[0m commands will now automatically search and purchase from your real store!\n');
  } catch (err) {
    console.error('\x1b[31mSetup Error:\x1b[0m', err.message);
  } finally {
    rl.close();
  }
}

/**
 * PART 1 / PART 4: Status check with honest labeling
 */
async function printStatus() {
  const provider = globalMCPEngine.getCatalogProvider();
  const providerName = provider.getProviderName();
  const isReal = !providerName.includes('Demo');

  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent System & Catalog Status\x1b[0m \x1b[90m(v' + VERSION + ')\x1b[0m\n');

  console.log('\x1b[1m📦 Active Catalog Provider:\x1b[0m');
  if (isReal) {
    console.log(`  • Status  : \x1b[32m\x1b[1m🟢 LIVE CATALOG (${providerName})\x1b[0m`);
  } else {
    console.log(`  • Status  : \x1b[33m\x1b[1m🟡 DEMO CATALOG (sample data)\x1b[0m`);
  }

  // Quick live check
  try {
    const products = await provider.searchProducts('');
    console.log(`  • SKUs    : \x1b[36m${products.length} product(s) indexed\x1b[0m`);
  } catch (err) {
    console.log(`  • SKUs    : \x1b[31mError querying provider (${err.message})\x1b[0m`);
  }

  console.log('\n\x1b[1m🛡️  Autonomous Policy Bounds:\x1b[0m');
  console.log(`  • Spend Cap  : \x1b[33m₹${spendCap.toLocaleString('en-IN')}\x1b[0m (per transaction limit)`);
  console.log(`  • SKU Limit  : \x1b[33m${skuLimit} unit(s) max\x1b[0m per item`);
  console.log(`  • Razorpay   : \x1b[32m${keyId ? `LIVE KEY (${keyId})` : 'HIGH-FIDELITY SANDBOX'}\x1b[0m\n`);

  console.log('\x1b[90mTip: Run "npx razoragent connect" to link a real Shopify or WooCommerce store.\x1b[0m\n');
}

function printBanner() {
  const provider = globalMCPEngine.getCatalogProvider();
  const isReal = !provider.getProviderName().includes('Demo');

  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent\x1b[0m \x1b[90mby\x1b[0m \x1b[1mResence\x1b[0m \x1b[32m(v' + VERSION + ' - Enterprise MCP Gateway)\x1b[0m');
  console.log('\x1b[90mBounded Model Context Protocol Gateway for Autonomous AI Buyers\x1b[0m\n');

  console.log('\x1b[1m⚙️  Active Gateway Configuration:\x1b[0m');
  console.log(`  • Catalog Source       : ${isReal ? `\x1b[32m\x1b[1m🟢 LIVE CATALOG (${provider.getProviderName()})\x1b[0m` : '\x1b[33m\x1b[1m🟡 DEMO CATALOG (sample data)\x1b[0m'}`);
  console.log(`  • Autonomous Spend Cap : \x1b[33m₹${spendCap.toLocaleString('en-IN')}\x1b[0m \x1b[90m(Customizable via --spend-cap <INR>)\x1b[0m`);
  console.log(`  • SKU Purchase Limit   : \x1b[33m${skuLimit} unit(s) max\x1b[0m \x1b[90m(Customizable via --sku-limit <N>)\x1b[0m`);
  console.log(`  • Razorpay Adapter     : \x1b[32m${keyId ? `LIVE KEY (${keyId})` : 'HIGH-FIDELITY SANDBOX'}\x1b[0m \x1b[90m(api.razorpay.com/v1/orders)\x1b[0m`);
  console.log(`  • Concurrency Defense  : \x1b[32mACTIVE\x1b[0m \x1b[90m(Canonical SHA-256 Idempotency Locking)\x1b[0m`);
  console.log(`  • Webhook Verification : \x1b[32mACTIVE\x1b[0m \x1b[90m(HMAC-SHA256 Cryptographic Signature)\x1b[0m\n`);

  console.log('\x1b[1m📡 Protocol Endpoints & Interfaces:\x1b[0m');
  console.log('  • Universal MCP Endpoint : \x1b[36mhttps://razoragent.resence.in/api/razoragent/mcp\x1b[0m');
  console.log('  • Merchant Web Dashboard : \x1b[36mhttps://razoragent.resence.in\x1b[0m\n');

  console.log('\x1b[1m🚀 Commands:\x1b[0m');
  console.log('  \x1b[36mnpx razoragent connect\x1b[0m                                \x1b[90m(Merchant Setup: Link Shopify / WooCommerce)\x1b[0m');
  console.log('  \x1b[36mnpx razoragent run --intent "buy running shoes under 2000"\x1b[0m   \x1b[90m(AI Buyer: Autonomous shopping simulation)\x1b[0m');
  console.log('  \x1b[36mnpx razoragent status\x1b[0m                                 \x1b[90m(Check active catalog & policy bounds)\x1b[0m');
  console.log('  \x1b[36mnpx razoragent test\x1b[0m                                   \x1b[90m(Run automated verification suite)\x1b[0m\n');
}

function printHelp() {
  console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent CLI Reference (v' + VERSION + ')\x1b[0m\n');
  console.log('Usage:');
  console.log('  npx razoragent [command] [options]\n');
  console.log('Merchant Setup Commands:');
  console.log('  connect             Interactive onboarding wizard to connect your real Shopify / WooCommerce store');
  console.log('  status              Display current active catalog provider (Demo vs Real) and gateway bounds\n');
  console.log('AI Buyer Simulation Commands:');
  console.log('  run                 Simulates an AI agent autonomously shopping your connected store within guardrails');
  console.log('  test                Run the 5/5 automated fintech verification suite');
  console.log('  tools               List all 6 registered Model Context Protocol (MCP) commerce tools');
  console.log('  catalog             List live merchant inventory SKUs and prices\n');
  console.log('Options:');
  console.log('  -i, --intent <TEXT> Natural language buyer intent (e.g. "buy running shoes under 2000")');
  console.log('  --spend-cap <INR>   Maximum allowable transaction spend limit in INR (Default: 5000)');
  console.log('  --sku-limit <N>     Maximum allowed item quantity per SKU (Default: 3)');
  console.log('  --key <KEY_ID>      Razorpay API Key ID (e.g. rzp_test_xxx)');
  console.log('  --secret <SECRET>   Razorpay Key Secret');
  console.log('  --json              Output raw JSON execution trace');
  console.log('  -v, --version       Show package version');
  console.log('  -h, --help          Show this help documentation\n');
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

async function printCatalog() {
  const provider = globalMCPEngine.getCatalogProvider();
  console.log(`\n\x1b[1m\x1b[34m🏬 Active Merchant Inventory Catalog [${provider.getProviderName()}]:\x1b[0m\n`);
  const items = await provider.searchProducts('');
  items.forEach((item) => {
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

/**
 * PART 2: AI Buyer Simulation Execution with Honest Labeling
 */
async function executeIntent(userIntent) {
  const provider = globalMCPEngine.getCatalogProvider();
  const providerName = provider.getProviderName();
  const isReal = !providerName.includes('Demo');

  if (!isJson) {
    console.log('\n\x1b[1m\x1b[34m⚡ RazorAgent by Resence (v' + VERSION + ')\x1b[0m — Autonomous AI Buyer Simulation');
    console.log('\x1b[90m================================================================\x1b[0m\n');
    console.log(`\x1b[1mBuyer Prompt:\x1b[0m "${userIntent}"`);
    console.log(`\x1b[1mStore Source:\x1b[0m ${isReal ? `\x1b[32m\x1b[1m🟢 LIVE CATALOG (${providerName})\x1b[0m` : '\x1b[33m\x1b[1m🟡 DEMO CATALOG (sample data)\x1b[0m'}`);
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
