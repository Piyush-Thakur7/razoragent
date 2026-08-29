import { NextRequest, NextResponse } from 'next/server';
import { MERCHANT_CATALOG, AVAILABLE_COUPONS } from '@/lib/razoragent/catalog-data';
import { globalMCPEngine } from '@/lib/razoragent/mcp-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;

  if (!query && !category && !maxPrice) {
    return NextResponse.json({
      catalog: MERCHANT_CATALOG,
      coupons: AVAILABLE_COUPONS,
      totalCount: MERCHANT_CATALOG.length,
    });
  }

  const results = await globalMCPEngine.executeTool('search_products', {
    query,
    category,
    max_price: maxPrice,
  });

  return NextResponse.json(results);
}
