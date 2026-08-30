import { NextRequest, NextResponse } from 'next/server';
import { globalMCPEngine } from '@/lib/razoragent/mcp-engine';

/**
 * Standard Model Context Protocol (MCP) JSON-RPC 2.0 Endpoint
 * Supports:
 * - "tools/list": Returns available tool schemas
 * - "tools/call": Executes a specific tool with arguments
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        { jsonrpc: '2.0', id: id || null, error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' } },
        { status: 400 }
      );
    }

    if (method === 'tools/list') {
      const tools = globalMCPEngine.listTools();
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools,
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'razoragent-mcp-gateway',
            version: '1.1.1',
            vendor: 'RazorAgent by Resence',
          },
        },
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params || {};
      if (!name) {
        return NextResponse.json(
          { jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params: tool name is required' } },
          { status: 400 }
        );
      }

      const result = await globalMCPEngine.executeTool(name, toolArgs || {});
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
          structuredData: result,
          isError: false,
        },
      });
    }

    return NextResponse.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: error?.message || 'Internal JSON-RPC Error' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  const tools = globalMCPEngine.listTools();
  return NextResponse.json({
    status: 'ACTIVE',
    protocol: 'Model Context Protocol (MCP) JSON-RPC 2.0',
    availableToolsCount: tools.length,
    tools: tools.map((t) => t.name),
    endpoint: '/api/razoragent/mcp',
  });
}
