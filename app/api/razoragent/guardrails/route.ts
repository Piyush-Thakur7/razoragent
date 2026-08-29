import { NextRequest, NextResponse } from 'next/server';
import { globalGuardrailEngine } from '@/lib/razoragent/guardrails';

export async function GET() {
  return NextResponse.json({
    config: globalGuardrailEngine.getConfig(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    globalGuardrailEngine.updateConfig(body);
    return NextResponse.json({
      success: true,
      config: globalGuardrailEngine.getConfig(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update guardrail config' }, { status: 500 });
  }
}
