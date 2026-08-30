/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 *
 * Powered by a pluggable Merchant-Agnostic Catalog Architecture (Shopify, WooCommerce, Demo).
 */
import { MCPToolDefinition } from './types';
import { CatalogProvider } from './catalog-provider';
export declare const MCP_TOOLS: MCPToolDefinition[];
export declare class MCPEngine {
    private catalogProvider;
    constructor(customProvider?: CatalogProvider);
    setCatalogProvider(provider: CatalogProvider): void;
    getCatalogProvider(): CatalogProvider;
    listTools(): MCPToolDefinition[];
    executeTool(toolName: string, args: Record<string, any>): Promise<any>;
    private searchProducts;
    private getProductDetails;
    private calculateCartQuote;
    private evaluateSpendPolicy;
    private createGuardedOrder;
    private verifyPaymentAndSettle;
}
export declare const globalMCPEngine: MCPEngine;
export declare const handleMCPRequest: (body: any) => Promise<any>;
//# sourceMappingURL=mcp-engine.d.ts.map