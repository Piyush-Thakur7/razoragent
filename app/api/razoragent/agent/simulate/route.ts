import { NextRequest, NextResponse } from 'next/server';
import { globalAgentSimulator } from '@/lib/razoragent/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, customIdempotencyKey, simulateRaceCondition } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await globalAgentSimulator.simulatePurchase(prompt, {
      customIdempotencyKey,
      simulateRaceCondition,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Agent simulation execution failed' },
      { status: 500 }
    );
  }
}
