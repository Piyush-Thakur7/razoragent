/**
 * RazorAgent Merchant Catalog Data
 * Realistic product catalog with pricing, stock levels, specs, and promotion rules.
 */

import { ProductItem } from './types';

export const MERCHANT_CATALOG: ProductItem[] = [
  {
    id: 'prod_kb_01',
    name: 'Keychron K2 Pro Wireless Mechanical Keyboard',
    category: 'electronics',
    price: 3499,
    rating: 4.9,
    reviewCount: 428,
    stock: 14,
    description: 'Compact 75% layout wireless mechanical keyboard with hot-swappable Gateron G Pro Red switches, RGB backlight, and Mac/Windows layout toggle.',
    specs: {
      connectivity: 'Bluetooth 5.1 / Type-C Wired',
      switches: 'Gateron G Pro Brown / Red',
      battery: '4000 mAh (up to 240 hours)',
      keycaps: 'Double-shot OSA PBT'
    },
    tags: ['keyboard', 'mechanical', 'wireless', 'office', 'coding', 'gadget'],
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['AGENT500', 'BUILD2026']
  },
  {
    id: 'prod_hp_02',
    name: 'Sony WH-1000XM5 Active Noise Cancelling Headphones',
    category: 'electronics',
    price: 18990,
    rating: 4.8,
    reviewCount: 1250,
    stock: 8,
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Hi-Res audio wireless with 30-hour battery life.',
    specs: {
      battery: '30 hours with ANC on',
      anc: 'Dual Processor V1 + HD QN1',
      weight: '250g',
      charging: '3 min charge = 3 hours playback'
    },
    tags: ['headphones', 'anc', 'audio', 'wireless', 'premium'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['PREMIUM10']
  },
  {
    id: 'prod_ear_03',
    name: 'Nothing Ear (2) True Wireless Earbuds',
    category: 'electronics',
    price: 3999,
    rating: 4.6,
    reviewCount: 680,
    stock: 22,
    description: 'Ultra-light 4.5g design with Hi-Res Audio certified 11.6mm custom driver and smart Active Noise Cancellation up to 40dB.',
    specs: {
      driver: '11.6mm dynamic',
      anc: 'Personalised ANC up to 40dB',
      battery: '36 hours total with case',
      waterResistance: 'IP54 buds / IP55 case'
    },
    tags: ['earbuds', 'wireless', 'anc', 'audio', 'gym', 'commute'],
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['AGENT500', 'EARBUD20']
  },
  {
    id: 'prod_cf_04',
    name: 'Blue Tokai Specialty Coffee Roast (Attikan Estate - 500g)',
    category: 'specialty-coffee',
    price: 780,
    rating: 4.9,
    reviewCount: 890,
    stock: 45,
    description: 'Medium-dark roast single origin 100% Arabica coffee from Biligirirangana Hills. Tasting notes: Dark chocolate, figs, and roasted almonds.',
    specs: {
      grind: 'Aeropress / Pour-Over / French Press',
      origin: 'Attikan Estate, Karnataka',
      altitude: '1650 MASL',
      processing: 'Washed'
    },
    tags: ['coffee', 'arabica', 'specialty', 'caffeine', 'beans', 'roast'],
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['COFFEE100', 'AGENT10']
  },
  {
    id: 'prod_ms_05',
    name: 'Logitech MX Master 3S Ergonomic Wireless Mouse',
    category: 'electronics',
    price: 4999,
    rating: 4.9,
    reviewCount: 2100,
    stock: 19,
    description: 'Ergonomic performance mouse with 8K DPI any-surface glass tracking, Quiet Clicks, and MagSpeed electromagnetic scrolling.',
    specs: {
      sensor: '8000 DPI Darkfield',
      scroll: 'MagSpeed 1000 lines/sec',
      connectivity: 'Bluetooth + Logi Bolt',
      battery: '70 days on full charge'
    },
    tags: ['mouse', 'ergonomic', 'office', 'coding', 'productivity'],
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['AGENT500']
  },
  {
    id: 'prod_bk_06',
    name: 'Aer Travel Pack 3 Ultra (Cordura Ballistic)',
    category: 'apparel',
    price: 6499,
    rating: 4.7,
    reviewCount: 310,
    stock: 6,
    description: 'Versatile carry-on backpack engineered for modern tech travel. Dedicated 16" laptop compartment and water-resistant YKK zippers.',
    specs: {
      capacity: '28L expandable to 35L',
      material: '1680D Cordura Ballistic Nylon',
      laptopCompartment: 'Fits up to 16" MacBook Pro',
      weight: '1.7 kg'
    },
    tags: ['backpack', 'travel', 'laptop bag', 'apparel', 'waterproof'],
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['TRAVEL15']
  },
  {
    id: 'prod_mat_07',
    name: 'Nordic Wool & Natural Rubber Desk Mat (Extra Large)',
    category: 'home-office',
    price: 1299,
    rating: 4.8,
    reviewCount: 154,
    stock: 35,
    description: 'Premium anti-fray desk pad with textured wool felt top and non-slip natural rubber base. Protects your desk and enhances workspace aesthetics.',
    specs: {
      dimensions: '900mm x 400mm x 4mm',
      materials: 'Eco-felt wool + Natural tree rubber',
      edge: 'Anti-fraying precision stitch'
    },
    tags: ['desk mat', 'desk pad', 'home office', 'minimalist', 'workspace'],
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['DESK200']
  },
  {
    id: 'prod_fit_08',
    name: 'Optimum Nutrition Gold Standard 100% Whey (Double Rich Chocolate 1kg)',
    category: 'wellness',
    price: 3199,
    rating: 4.8,
    reviewCount: 4200,
    stock: 28,
    description: '24g of high-quality protein per serving with 5.5g naturally occurring BCAAs to support muscle recovery and lean growth.',
    specs: {
      proteinPerScoop: '24 grams',
      servings: '31 servings',
      flavor: 'Double Rich Chocolate',
      certifications: 'Informed-Choice Trusted by Sport'
    },
    tags: ['protein', 'whey', 'fitness', 'wellness', 'nutrition', 'workout'],
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80',
    eligibleCoupons: ['FIT10', 'AGENT500']
  }
];

export const AVAILABLE_COUPONS: Record<string, { discountPercent?: number; flatDiscountINR?: number; minSpendINR: number }> = {
  'AGENT500': { flatDiscountINR: 500, minSpendINR: 2500 },
  'BUILD2026': { discountPercent: 15, minSpendINR: 2000 },
  'COFFEE100': { flatDiscountINR: 100, minSpendINR: 500 },
  'FIT10': { discountPercent: 10, minSpendINR: 1500 },
  'DESK200': { flatDiscountINR: 200, minSpendINR: 1000 },
  'PREMIUM10': { discountPercent: 10, minSpendINR: 10000 },
};
