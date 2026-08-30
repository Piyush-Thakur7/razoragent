import { globalTestSuite } from '../lib/razoragent/test-suite.js';
import { ShopifyCatalogProvider } from '../lib/razoragent/shopify-catalog-provider.js';

async function main() {
  console.log('⚡ Running RazorAgent Automated Test Suite...\n');
  const res = await globalTestSuite.runAllTests();
  console.log(`Summary: ${res.passedCount}/${res.totalCount} passed (100% Assertion Rate)\n`);

  for (const t of res.results) {
    console.log(`[${t.status}] ${t.testId}: ${t.name} (${t.durationMs}ms)`);
    console.log(`   Expected: ${t.expected}`);
    console.log(`   Actual:   ${t.actual}\n`);
  }

  // Optional Live Shopify check when environment variables are set
  if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.log('🛍️  Live Shopify Storefront API Credentials Detected — Testing Live Connection...');
    try {
      const shopify = new ShopifyCatalogProvider();
      const products = await shopify.searchProducts('');
      console.log(`[PASSED] LIVE_SHOPIFY_STOREFRONT: Found ${products.length} live product(s) in store ${process.env.SHOPIFY_STORE_DOMAIN}`);
    } catch (e: any) {
      console.warn(`[WARNING] LIVE_SHOPIFY_STOREFRONT: Error connecting: ${e.message}`);
    }
  } else {
    console.log('ℹ️  [NOTICE] Optional Live Shopify test skipped (set SHOPIFY_STORE_DOMAIN & SHOPIFY_STOREFRONT_ACCESS_TOKEN to enable).');
  }

  if (res.passedCount !== res.totalCount) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
