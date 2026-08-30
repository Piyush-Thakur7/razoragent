/**
 * ⚡ RazorAgent Core SDK
 * Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway
 */
export * from './types';
export * from './catalog-provider';
export * from './catalog-data';
export * from './shopify-catalog-provider';
export * from './woocommerce-catalog-provider';
export * from './guardrails';
export * from './idempotency';
export * from './razorpay';
export * from './mcp-engine';
export { AgentSimulator, globalAgentSimulator } from './agent-engine';
export * from './test-suite';
import { GuardrailPolicyConfig } from './types';
/**
 * Universal JSON-RPC 2.0 Handler for Next.js / Express / Node.js backends
 */
export declare function handleMCPRequest(jsonRpcBody: {
    jsonrpc?: string;
    method: string;
    params?: {
        name: string;
        arguments?: Record<string, unknown>;
    };
    id?: string | number;
}, policyConfig?: Partial<GuardrailPolicyConfig>): Promise<{
    jsonrpc: string;
    id: string | number;
    result: {
        tools: import("./types").MCPToolDefinition[];
        content?: undefined;
    };
    error?: undefined;
} | {
    jsonrpc: string;
    id: string | number;
    error: {
        code: number;
        message: string;
    };
    result?: undefined;
} | {
    jsonrpc: string;
    id: string | number;
    result: {
        content: {
            type: string;
            text: string;
        }[];
        tools?: undefined;
    };
    error?: undefined;
}>;
//# sourceMappingURL=index.d.ts.map