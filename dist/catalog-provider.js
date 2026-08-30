"use strict";
/**
 * RazorAgent Pluggable Catalog Architecture
 * Universal Merchant-Agnostic Interface Contract.
 *
 * Any e-commerce platform (Shopify, WooCommerce, Magento, Custom Postgres/MongoDB)
 * connects to RazorAgent by implementing this 3-method interface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogConnectionError = void 0;
class CatalogConnectionError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.name = 'CatalogConnectionError';
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, CatalogConnectionError.prototype);
    }
}
exports.CatalogConnectionError = CatalogConnectionError;
//# sourceMappingURL=catalog-provider.js.map