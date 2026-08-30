/**
 * RazorAgent WooCommerce REST API Catalog Provider
 * Production REST adapter for WooCommerce / WordPress merchants.
 *
 * Maps WooCommerce products, variations, attributes, and stock into
 * RazorAgent's bounded MCP commerce and settlement pipeline.
 */
import { CatalogProvider, CatalogSearchFilters } from './catalog-provider';
import { ProductItem } from './types';
export declare class WooCommerceCatalogProvider implements CatalogProvider {
    private siteUrl;
    private consumerKey;
    private consumerSecret;
    constructor(options?: {
        siteUrl?: string;
        consumerKey?: string;
        consumerSecret?: string;
    });
    isConfigured(): boolean;
    getProviderName(): string;
    /**
     * Searches WooCommerce products via /wp-json/wc/v3/products.
     */
    searchProducts(query: string, filters?: CatalogSearchFilters): Promise<ProductItem[]>;
    /**
     * Retrieves single WooCommerce product by ID.
     */
    getProductDetails(productId: string): Promise<ProductItem | null>;
}
//# sourceMappingURL=woocommerce-catalog-provider.d.ts.map