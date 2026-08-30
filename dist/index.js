"use strict";
/**
 * ⚡ RazorAgent Core SDK
 * Bounded Model Context Protocol (MCP) Commerce & Settlement Gateway
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalAgentSimulator = exports.AgentSimulator = void 0;
exports.handleMCPRequest = handleMCPRequest;
__exportStar(require("./types"), exports);
__exportStar(require("./catalog-data"), exports);
__exportStar(require("./guardrails"), exports);
__exportStar(require("./idempotency"), exports);
__exportStar(require("./razorpay"), exports);
__exportStar(require("./mcp-engine"), exports);
var agent_engine_1 = require("./agent-engine");
Object.defineProperty(exports, "AgentSimulator", { enumerable: true, get: function () { return agent_engine_1.AgentSimulator; } });
Object.defineProperty(exports, "globalAgentSimulator", { enumerable: true, get: function () { return agent_engine_1.globalAgentSimulator; } });
__exportStar(require("./test-suite"), exports);
const mcp_engine_1 = require("./mcp-engine");
/**
 * Universal JSON-RPC 2.0 Handler for Next.js / Express / Node.js backends
 */
async function handleMCPRequest(jsonRpcBody, policyConfig) {
    const id = jsonRpcBody.id || 1;
    if (jsonRpcBody.method === 'tools/list') {
        return {
            jsonrpc: '2.0',
            id,
            result: { tools: mcp_engine_1.MCP_TOOLS },
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
        const result = await mcp_engine_1.globalMCPEngine.executeTool(toolName, toolArgs);
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
//# sourceMappingURL=index.js.map