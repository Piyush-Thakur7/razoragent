# Changelog

All notable changes to **RazorAgent by Resence** (`razoragent`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-08-30

### Fixed
* **Strict Error Handling in `npx razoragent connect` Wizard:**
  - Added `CatalogConnectionError` across `ShopifyCatalogProvider` and `WooCommerceCatalogProvider`.
  - Fixed false-positive "Connected, 0 products returned" on HTTP 401/403/404 errors when invalid credentials are provided.
  - Wizard now halts with clear failure message and non-zero exit code, refusing to save invalid credentials to `.env.local`.

---

## [1.1.0] - 2026-08-30

### Added
* **Pluggable Catalog Architecture (`CatalogProvider` Contract):**
  - Abstracted catalog data access behind a 3-method asynchronous interface (`searchProducts`, `getProductDetails`, `getProviderName`).
  - Allows Shopify, WooCommerce, Magento, and custom merchant databases to connect to RazorAgent seamlessly.
* **Production Shopify Storefront API Adapter (`ShopifyCatalogProvider`):**
  - Direct GraphQL integration against `/api/2024-01/graphql.json` using `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
  - Maps Shopify variants, prices, images, and inventory into RazorAgent's bounded quoting engine.
* **Production WooCommerce REST API Adapter (`WooCommerceCatalogProvider`):**
  - Direct REST v3 integration against `/wp-json/wc/v3/products` using Consumer Key and Secret.
* **Interactive Merchant Onboarding Wizard (`npx razoragent connect`):**
  - Step-by-step CLI setup wizard that validates storefront credentials against live store APIs and saves configuration to `.env.local`.
* **Gateway Status Command (`npx razoragent status`):**
  - Inspects active catalog provider, SKU index count, spend caps, and Razorpay API connection mode.
* **Web Onboarding Wizard (`/connect` and Modal):**
  - 3-step visual onboarding page with live product discovery previews and session-scoped testing.
* **Honest Catalog Source Labeling:**
  - Clear `🟢 LIVE CATALOG (your-store.myshopify.com)` vs `🟡 DEMO CATALOG (sample data)` indicators in both CLI outputs and Web UI headers.
* **Pluggable Catalog Verification Suite (`TEST_06_PLUGGABLE_CATALOG`):**
  - Automated contract and resolution testing for catalog providers.

---

## [1.0.6] - 2026-08-30

### Fixed
* **Compiled TypeScript Module Output:**
  - Added scoped `tsconfig.build.json` compiling `lib/razoragent/*.ts` into CommonJS and `.d.ts` declaration maps in `dist/`.
  - Fixed `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` when importing `razoragent` in standard Node.js applications.
* **Category-Aware Search Relevance:**
  - Added primary entity disambiguation to prevent cross-category false positives (e.g. Desk Mats returning for "wireless mouse", or Laptop Stands returning for "laptop").
  - Expanded catalog to 28+ varied products across 7 categories.
* **Zero-Dependency Published Package:**
  - Cleaned runtime dependencies (`dependencies: {}`), moving Next.js/React to `devDependencies`.
  - 0 npm audit vulnerabilities.
* **GitHub Actions CI:**
  - Added `.github/workflows/ci.yml` running builds and verification suites on Node.js 18.x and 20.x.
* **Git Hygiene:**
  - Removed committed tarballs from source control, added `*.tgz` to `.gitignore`, and added `CONTRIBUTING.md`.
