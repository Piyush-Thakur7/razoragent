import { NextResponse } from 'next/server';
import { globalTestSuite } from '@/lib/razoragent/test-suite';

export async function POST() {
  try {
    const report = await globalTestSuite.runAllTests();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to execute test suite' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
