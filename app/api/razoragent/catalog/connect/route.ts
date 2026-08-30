import { NextRequest, NextResponse } from 'next/server';
import { globalMCPEngine } from '@/lib/razoragent/mcp-engine';
import { ShopifyCatalogProvider } from '@/lib/razoragent/shopify-catalog-provider';
import { WooCommerceCatalogProvider } from '@/lib/razoragent/woocommerce-catalog-provider';
import { globalDemoCatalogProvider } from '@/lib/razoragent/catalog-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, domain, token, siteUrl, consumerKey, consumerSecret } = body;

    if (platform === 'shopify') {
      if (!domain || !token) {
        return NextResponse.json({ error: 'Shopify Store Domain and Storefront Access Token are required' }, { status: 400 });
      }

      const provider = new ShopifyCatalogProvider({
        storeDomain: domain,
        storefrontAccessToken: token,
      });

      const products = await provider.searchProducts('');
      globalMCPEngine.setCatalogProvider(provider);

      return NextResponse.json({
        success: true,
        provider: provider.getProviderName(),
        isLive: true,
        productCount: products.length,
        preview: products.slice(0, 4),
        message: `Successfully connected to Shopify! Found ${products.length} live product(s).`,
      });
    }

    if (platform === 'woocommerce') {
      if (!siteUrl || !consumerKey || !consumerSecret) {
        return NextResponse.json({ error: 'WooCommerce Site URL, Consumer Key, and Consumer Secret are required' }, { status: 400 });
      }

      const provider = new WooCommerceCatalogProvider({
        siteUrl,
        consumerKey,
        consumerSecret,
      });

      const products = await provider.searchProducts('');
      globalMCPEngine.setCatalogProvider(provider);

      return NextResponse.json({
        success: true,
        provider: provider.getProviderName(),
        isLive: true,
        productCount: products.length,
        preview: products.slice(0, 4),
        message: `Successfully connected to WooCommerce! Found ${products.length} product(s).`,
      });
    }

    // Reset to demo catalog
    globalMCPEngine.setCatalogProvider(globalDemoCatalogProvider);
    const demoProducts = await globalDemoCatalogProvider.searchProducts('');

    return NextResponse.json({
      success: true,
      provider: globalDemoCatalogProvider.getProviderName(),
      isLive: false,
      productCount: demoProducts.length,
      preview: demoProducts.slice(0, 4),
      message: 'Active catalog reset to Demo In-Memory Catalog (Sample Data).',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection test failed' }, { status: 500 });
  }
}

export async function GET() {
  const provider = globalMCPEngine.getCatalogProvider();
  const name = provider.getProviderName();
  const isLive = !name.includes('Demo');

  let productCount = 0;
  try {
    const prods = await provider.searchProducts('');
    productCount = prods.length;
  } catch (e) {
    // Ignore
  }

  return NextResponse.json({
    provider: name,
    isLive,
    productCount,
  });
}
