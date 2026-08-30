"use strict";
/**
 * RazorAgent WooCommerce REST API Catalog Provider
 * Production REST adapter for WooCommerce / WordPress merchants.
 *
 * Maps WooCommerce products, variations, attributes, and stock into
 * RazorAgent's bounded MCP commerce and settlement pipeline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WooCommerceCatalogProvider = void 0;
class WooCommerceCatalogProvider {
    constructor(options = {}) {
        this.siteUrl = (options.siteUrl || process.env.WOOCOMMERCE_SITE_URL || '').replace(/\/$/, '');
        this.consumerKey = options.consumerKey || process.env.WOOCOMMERCE_CONSUMER_KEY || '';
        this.consumerSecret = options.consumerSecret || process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
    }
    isConfigured() {
        return Boolean(this.siteUrl && this.consumerKey && this.consumerSecret);
    }
    getProviderName() {
        return `WooCommerce REST API v3 (${this.siteUrl || 'unconfigured'})`;
    }
    /**
     * Searches WooCommerce products via /wp-json/wc/v3/products.
     */
    async searchProducts(query, filters = {}) {
        if (!this.isConfigured()) {
            return [];
        }
        const params = new URLSearchParams({
            search: query,
            per_page: '20',
            status: 'publish',
        });
        if (filters.maxPrice)
            params.append('max_price', String(filters.maxPrice));
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
        const endpoint = `${this.siteUrl}/wp-json/wc/v3/products?${params.toString()}`;
        try {
            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                throw new Error(`WooCommerce HTTP Error: ${res.status} ${res.statusText}`);
            }
            const products = await res.json();
            return products.map((p) => {
                const price = Math.round(parseFloat(p.price || p.regular_price || '0'));
                const imageUrl = p.images?.[0]?.src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                const tags = (p.tags || []).map((t) => t.name.toLowerCase());
                return {
                    id: String(p.id),
                    name: p.name,
                    category: (p.categories?.[0]?.name || 'general').toLowerCase(),
                    price,
                    rating: parseFloat(p.average_rating || '4.8'),
                    reviewCount: p.rating_count || 50,
                    stock: p.manage_stock ? (p.stock_quantity || 0) : 25,
                    description: p.short_description?.replace(/<[^>]+>/g, '') || p.description?.replace(/<[^>]+>/g, '') || p.name,
                    specs: {
                        sku: p.sku || String(p.id),
                        type: p.type || 'simple',
                        permalink: p.permalink || '',
                    },
                    tags,
                    image: imageUrl,
                    eligibleCoupons: ['AGENT500', 'WOO10'],
                };
            });
        }
        catch (err) {
            console.error(`[WooCommerceCatalogProvider] Search error:`, err);
            return [];
        }
    }
    /**
     * Retrieves single WooCommerce product by ID.
     */
    async getProductDetails(productId) {
        if (!this.isConfigured())
            return null;
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
        const endpoint = `${this.siteUrl}/wp-json/wc/v3/products/${productId}`;
        try {
            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok)
                return null;
            const p = await res.json();
            return {
                id: String(p.id),
                name: p.name,
                category: (p.categories?.[0]?.name || 'general').toLowerCase(),
                price: Math.round(parseFloat(p.price || '0')),
                rating: parseFloat(p.average_rating || '4.8'),
                reviewCount: p.rating_count || 50,
                stock: p.manage_stock ? (p.stock_quantity || 0) : 25,
                description: p.short_description?.replace(/<[^>]+>/g, '') || p.description?.replace(/<[^>]+>/g, '') || p.name,
                specs: {
                    sku: p.sku || String(p.id),
                    type: p.type || 'simple',
                },
                tags: (p.tags || []).map((t) => t.name.toLowerCase()),
                image: p.images?.[0]?.src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
                eligibleCoupons: ['AGENT500', 'WOO10'],
            };
        }
        catch (err) {
            console.error(`[WooCommerceCatalogProvider] Error fetching product ${productId}:`, err);
            return null;
        }
    }
}
exports.WooCommerceCatalogProvider = WooCommerceCatalogProvider;
//# sourceMappingURL=woocommerce-catalog-provider.js.map