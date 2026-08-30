/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 */
import { MCPToolDefinition } from './types';
export declare const MCP_TOOLS: MCPToolDefinition[];
export declare class MCPEngine {
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
//# sourceMappingURL=mcp-engine.d.ts.map