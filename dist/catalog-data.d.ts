/**
 * RazorAgent Merchant Catalog Data
 * Realistic product catalog with pricing, stock levels, specs, and promotion rules.
 * Expanded to 28+ varied products across 7 categories for realistic free-text semantic search.
 */
import { ProductItem } from './types';
export declare const MERCHANT_CATALOG: ProductItem[];
export declare const AVAILABLE_COUPONS: Record<string, {
    discountPercent?: number;
    flatDiscountINR?: number;
    minSpendINR: number;
    maxDiscountINR?: number;
    description?: string;
}>;
import { CatalogProvider, CatalogSearchFilters } from './catalog-provider';
/**
 * DemoCatalogProvider
 * In-memory zero-configuration reference implementation for testing, demos, and local development.
 */
export declare class DemoCatalogProvider implements CatalogProvider {
    searchProducts(query: string, filters?: CatalogSearchFilters): Promise<ProductItem[]>;
    getProductDetails(productId: string): Promise<ProductItem | null>;
    getProviderName(): string;
}
export declare const globalDemoCatalogProvider: DemoCatalogProvider;
//# sourceMappingURL=catalog-data.d.ts.map