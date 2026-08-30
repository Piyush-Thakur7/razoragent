/**
 * RazorAgent WooCommerce REST API Catalog Provider
 * Production REST adapter for WooCommerce / WordPress merchants.
 * 
 * Maps WooCommerce products, variations, attributes, and stock into
 * RazorAgent's bounded MCP commerce and settlement pipeline.
 */

import { CatalogProvider, CatalogSearchFilters, CatalogConnectionError } from './catalog-provider';
import { ProductItem } from './types';

export class WooCommerceCatalogProvider implements CatalogProvider {
  private siteUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(options: { siteUrl?: string; consumerKey?: string; consumerSecret?: string } = {}) {
    this.siteUrl = (options.siteUrl || process.env.WOOCOMMERCE_SITE_URL || '').replace(/\/$/, '');
    this.consumerKey = options.consumerKey || process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    this.consumerSecret = options.consumerSecret || process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.siteUrl && this.consumerKey && this.consumerSecret);
  }

  public getProviderName(): string {
    return `WooCommerce REST API v3 (${this.siteUrl || 'unconfigured'})`;
  }

  /**
   * Searches WooCommerce products via /wp-json/wc/v3/products.
   * Throws CatalogConnectionError on authentication / network / HTTP errors.
   */
  public async searchProducts(query: string, filters: CatalogSearchFilters = {}): Promise<ProductItem[]> {
    if (!this.isConfigured()) {
      throw new CatalogConnectionError('WooCommerce credentials (site URL, consumer key, consumer secret) are not configured.', 400);
    }

    const params = new URLSearchParams({
      search: query,
      per_page: '20',
      status: 'publish',
    });

    if (filters.maxPrice) params.append('max_price', String(filters.maxPrice));

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const endpoint = `${this.siteUrl}/wp-json/wc/v3/products?${params.toString()}`;

    let res: Response;
    try {
      res = await fetch(endpoint, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (netErr: any) {
      throw new CatalogConnectionError(
        `Network error connecting to WooCommerce store (${this.siteUrl}): ${netErr.message}`,
        503,
        netErr
      );
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new CatalogConnectionError(
          `Invalid WooCommerce Consumer Key or Secret (HTTP ${res.status} ${res.statusText})`,
          res.status
        );
      }
      if (res.status === 404) {
        throw new CatalogConnectionError(
          `WooCommerce REST endpoint not found at ${this.siteUrl}/wp-json/wc/v3/products (HTTP 404)`,
          404
        );
      }
      throw new CatalogConnectionError(
        `WooCommerce REST API HTTP Error: ${res.status} ${res.statusText}`,
        res.status
      );
    }

    let products: any[];
    try {
      products = await res.json();
    } catch (parseErr: any) {
      throw new CatalogConnectionError(
        `Invalid JSON returned from WooCommerce API (${this.siteUrl})`,
        502,
        parseErr
      );
    }

    if (!Array.isArray(products)) {
      if ((products as any)?.message) {
        throw new CatalogConnectionError(`WooCommerce API Error: ${(products as any).message}`, 400, products);
      }
      return [];
    }

    return products.map((p) => {
      const price = Math.round(parseFloat(p.price || p.regular_price || '0'));
      const imageUrl = p.images?.[0]?.src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
      const tags = (p.tags || []).map((t: any) => t.name.toLowerCase());

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

  /**
   * Retrieves single WooCommerce product by ID.
   */
  public async getProductDetails(productId: string): Promise<ProductItem | null> {
    if (!this.isConfigured()) return null;

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const endpoint = `${this.siteUrl}/wp-json/wc/v3/products/${productId}`;

    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) return null;
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
        tags: (p.tags || []).map((t: any) => t.name.toLowerCase()),
        image: p.images?.[0]?.src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        eligibleCoupons: ['AGENT500', 'WOO10'],
      };
    } catch (err) {
      console.error(`[WooCommerceCatalogProvider] Error fetching product ${productId}:`, err);
      return null;
    }
  }
}
