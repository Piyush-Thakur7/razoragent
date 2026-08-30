/**
 * RazorAgent Shopify Storefront API Catalog Provider
 * Production GraphQL integration for Shopify merchants.
 *
 * Maps Shopify products, variants, images, and prices directly into
 * RazorAgent's bounded MCP commerce and settlement pipeline.
 */
import { CatalogProvider, CatalogSearchFilters } from './catalog-provider';
import { ProductItem } from './types';
export declare class ShopifyCatalogProvider implements CatalogProvider {
    private storeDomain;
    private storefrontAccessToken;
    private apiVersion;
    constructor(options?: {
        storeDomain?: string;
        storefrontAccessToken?: string;
        apiVersion?: string;
    });
    isConfigured(): boolean;
    getProviderName(): string;
    private executeGraphQL;
    /**
     * Searches Shopify products using Storefront GraphQL API.
     */
    searchProducts(query: string, filters?: CatalogSearchFilters): Promise<ProductItem[]>;
    /**
     * Retrieves single Shopify product details by ID.
     */
    getProductDetails(productId: string): Promise<ProductItem | null>;
}
//# sourceMappingURL=shopify-catalog-provider.d.ts.map