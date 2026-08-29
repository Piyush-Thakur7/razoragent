import { NextRequest, NextResponse } from 'next/server';
import { globalRazorpayAdapter } from '@/lib/razoragent/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, payment_id, signature } = body;

    if (!order_id || !payment_id) {
      return NextResponse.json({ error: 'order_id and payment_id are required' }, { status: 400 });
    }

    const testSignature = signature || globalRazorpayAdapter.generateTestSignature(order_id, payment_id);
    const isValid = globalRazorpayAdapter.verifySignature(order_id, payment_id, testSignature);

    return NextResponse.json({
      verified: isValid,
      order_id,
      payment_id,
      signature: testSignature,
      status: isValid ? 'CAPTURED_AND_SETTLED' : 'VERIFICATION_FAILED',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Verification failed' }, { status: 500 });
  }
}
