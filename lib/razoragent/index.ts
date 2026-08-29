/**
 * ⚡ RazorAgent Core SDK
 * Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway
 */

export * from './types';
export * from './catalog-data';
export * from './guardrails';
export * from './idempotency';
export * from './razorpay';
export * from './mcp-engine';
export { AgentSimulator, globalAgentSimulator } from './agent-engine';
export * from './test-suite';

import { MCP_TOOLS, globalMCPEngine } from './mcp-engine';
import { GuardrailPolicyConfig } from './types';

/**
 * Universal JSON-RPC 2.0 Handler for Next.js / Express / Node.js backends
 */
export async function handleMCPRequest(
  jsonRpcBody: { jsonrpc?: string; method: string; params?: { name: string; arguments?: Record<string, unknown> }; id?: string | number },
  policyConfig?: Partial<GuardrailPolicyConfig>
) {
  const id = jsonRpcBody.id || 1;

  if (jsonRpcBody.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: MCP_TOOLS },
    };
  }

  if (jsonRpcBody.method === 'tools/call') {
    const toolName = jsonRpcBody.params?.name;
    const toolArgs = jsonRpcBody.params?.arguments || {};

    if (!toolName) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Invalid params: tool name is required' },
      };
    }

    const result = await globalMCPEngine.executeTool(toolName, toolArgs);
    return {
      jsonrpc: '2.0',
      id,
      result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${jsonRpcBody.method}` },
  };
}
