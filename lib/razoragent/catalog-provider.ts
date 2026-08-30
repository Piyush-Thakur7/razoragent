/**
 * RazorAgent Pluggable Catalog Architecture
 * Universal Merchant-Agnostic Interface Contract.
 * 
 * Any e-commerce platform (Shopify, WooCommerce, Magento, Custom Postgres/MongoDB)
 * connects to RazorAgent by implementing this 3-method interface.
 */

import { ProductItem } from './types';

export interface CatalogSearchFilters {
  category?: string;
  maxPrice?: number;
  minRating?: number;
}

export interface CatalogProvider {
  /**
   * Searches the merchant inventory using semantic queries and filters.
   * @param query Natural language or keyword search string
   * @param filters Optional category, price ceiling, and rating constraints
   */
  searchProducts(query: string, filters?: CatalogSearchFilters): Promise<ProductItem[]>;

  /**
   * Retrieves full technical specifications, variant pricing, and live stock for a specific SKU.
   * @param productId Unique SKU / product identifier
   */
  getProductDetails(productId: string): Promise<ProductItem | null>;

  /**
   * Human-readable identifier for audit trails and telemetry.
   * e.g. "Shopify Storefront API (GraphQL)", "WooCommerce REST API v3", "Demo In-Memory Catalog"
   */
  getProviderName(): string;
}

export class CatalogConnectionError extends Error {
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'CatalogConnectionError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, CatalogConnectionError.prototype);
  }
}
