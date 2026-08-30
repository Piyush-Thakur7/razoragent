"use strict";
/**
 * RazorAgent Shopify Storefront API Catalog Provider
 * Production GraphQL integration for Shopify merchants.
 *
 * Maps Shopify products, variants, images, and prices directly into
 * RazorAgent's bounded MCP commerce and settlement pipeline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyCatalogProvider = void 0;
class ShopifyCatalogProvider {
    constructor(options = {}) {
        this.storeDomain = (options.storeDomain || process.env.SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
        this.storefrontAccessToken = options.storefrontAccessToken || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
        this.apiVersion = options.apiVersion || '2024-01';
    }
    isConfigured() {
        return Boolean(this.storeDomain && this.storefrontAccessToken);
    }
    getProviderName() {
        return `Shopify Storefront API (${this.storeDomain || 'unconfigured'})`;
    }
    async executeGraphQL(query, variables = {}) {
        if (!this.isConfigured()) {
            throw new Error(`[ShopifyCatalogProvider] Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN.`);
        }
        const endpoint = `https://${this.storeDomain}/api/${this.apiVersion}/graphql.json`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
            },
            body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) {
            throw new Error(`Shopify Storefront GraphQL HTTP Error: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        if (json.errors && json.errors.length > 0) {
            throw new Error(`Shopify GraphQL Error: ${json.errors.map((e) => e.message).join(', ')}`);
        }
        return json.data;
    }
    /**
     * Searches Shopify products using Storefront GraphQL API.
     */
    async searchProducts(query, filters = {}) {
        if (!this.isConfigured()) {
            console.warn(`[ShopifyCatalogProvider] Storefront credentials not configured.`);
            return [];
        }
        const searchQuery = query ? `title:*${query}* OR tag:*${query}* OR product_type:*${query}*` : '';
        const gql = `
      query searchStorefrontProducts($query: String, $first: Int) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              description
              productType
              tags
              totalInventory
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    quantityAvailable
                  }
                }
              }
            }
          }
        }
      }
    `;
        try {
            const data = await this.executeGraphQL(gql, {
                query: searchQuery || undefined,
                first: 20,
            });
            const items = [];
            for (const edge of data.products.edges) {
                const node = edge.node;
                const rawPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
                const price = Math.round(rawPrice);
                // Filter constraints
                if (filters.maxPrice && price > filters.maxPrice)
                    continue;
                if (filters.category && node.productType.toLowerCase() !== filters.category.toLowerCase())
                    continue;
                const imageUrl = node.images?.edges?.[0]?.node?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                const stock = typeof node.totalInventory === 'number' ? node.totalInventory : 20;
                items.push({
                    id: node.id,
                    name: node.title,
                    category: (node.productType || 'general').toLowerCase(),
                    price,
                    rating: 4.8,
                    reviewCount: 150,
                    stock: Math.max(0, stock),
                    description: node.description || node.title,
                    specs: {
                        shopifyId: node.id,
                        productType: node.productType || 'Standard Item',
                        variantsCount: String(node.variants?.edges?.length || 1),
                    },
                    tags: Array.isArray(node.tags) ? node.tags : [],
                    image: imageUrl,
                    eligibleCoupons: ['AGENT500', 'SHOPIFY10'],
                });
            }
            return items;
        }
        catch (err) {
            console.error(`[ShopifyCatalogProvider] Error searching Shopify products:`, err);
            return [];
        }
    }
    /**
     * Retrieves single Shopify product details by ID.
     */
    async getProductDetails(productId) {
        if (!this.isConfigured())
            return null;
        const gql = `
      query getProductById($id: ID!) {
        product(id: $id) {
          id
          title
          description
          productType
          tags
          totalInventory
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `;
        try {
            const data = await this.executeGraphQL(gql, { id: productId });
            if (!data.product)
                return null;
            const node = data.product;
            const price = Math.round(parseFloat(node.priceRange?.minVariantPrice?.amount || '0'));
            const imageUrl = node.images?.edges?.[0]?.node?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
            return {
                id: node.id,
                name: node.title,
                category: (node.productType || 'general').toLowerCase(),
                price,
                rating: 4.8,
                reviewCount: 150,
                stock: typeof node.totalInventory === 'number' ? node.totalInventory : 20,
                description: node.description || node.title,
                specs: {
                    shopifyId: node.id,
                    productType: node.productType || 'Standard',
                },
                tags: Array.isArray(node.tags) ? node.tags : [],
                image: imageUrl,
                eligibleCoupons: ['AGENT500', 'SHOPIFY10'],
            };
        }
        catch (err) {
            console.error(`[ShopifyCatalogProvider] Error fetching product ${productId}:`, err);
            return null;
        }
    }
}
exports.ShopifyCatalogProvider = ShopifyCatalogProvider;
//# sourceMappingURL=shopify-catalog-provider.js.map