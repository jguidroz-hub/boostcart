/**
 * GET /api/widget/offer
 * 
 * Called by the storefront widget to get the applicable upsell offer
 * for a given order. This is the primary offer matching endpoint.
 * 
 * Query params:
 *   - storeHash: The BC store hash
 *   - orderId: The BC order ID (from order confirmation page)
 *   - productIds: Comma-separated product IDs from the order (optional optimization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveStore } from '@/lib/auth';
import { createBCClient } from '@/lib/bigcommerce';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeHash = searchParams.get('storeHash');
    const orderId = searchParams.get('orderId');
    const productIdsParam = searchParams.get('productIds');

    if (!storeHash || !orderId) {
      return NextResponse.json(
        { error: 'Missing storeHash or orderId' },
        { status: 400 },
      );
    }

    // Verify store exists and is active
    const store = await getActiveStore(storeHash);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get order products — either from query param or fetch from BC API
    let orderProductIds: number[] = [];

    if (productIdsParam) {
      orderProductIds = productIdsParam.split(',').map((id) => parseInt(id)).filter((id) => !isNaN(id));
    } else {
      // Fetch order products from BigCommerce
      try {
        const client = createBCClient(storeHash, store.accessToken);
        const orderProducts = await client.getOrderProducts(parseInt(orderId));
        orderProductIds = orderProducts.map((p) => p.product_id);
      } catch {
        // If we can't fetch order products, fall back to "any" trigger matching
      }
    }

    // Get all active offers for this store
    const offers = await prisma.offer.findMany({
      where: {
        storeId: store.id,
        status: 'active',
        type: { in: ['post_purchase', 'thank_you'] },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Match offers against order products
    const matchedOffer = offers.find((offer) => {
      // "any" trigger matches all orders
      if (offer.triggerType === 'any') return true;

      // "product" trigger — check if any order product matches trigger IDs
      if (offer.triggerType === 'product' && orderProductIds.length > 0) {
        return offer.triggerIds.some((triggerId) =>
          orderProductIds.includes(parseInt(triggerId)),
        );
      }

      // "category" trigger — would need to fetch product categories from BC
      // For MVP, we match category offers against any order
      if (offer.triggerType === 'category') return true;

      return false;
    });

    if (!matchedOffer) {
      return NextResponse.json({ data: null });
    }

    // Don't offer the same product that was just purchased
    if (orderProductIds.includes(matchedOffer.upsellProductId)) {
      // Try the next match
      const alternateOffer = offers.find(
        (offer) =>
          offer.id !== matchedOffer.id && !orderProductIds.includes(offer.upsellProductId),
      );
      if (!alternateOffer) {
        return NextResponse.json({ data: null });
      }
      return respondWithOffer(alternateOffer, store, storeHash);
    }

    return respondWithOffer(matchedOffer, store, storeHash);
  } catch (error) {
    console.error('GET /api/widget/offer error:', error);
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
  }
}

async function respondWithOffer(
  offer: {
    id: string;
    upsellProductId: number;
    title: string;
    description: string | null;
    discountType: string | null;
    discountValue: number | null;
    ctaText: string;
    declineText: string;
    showTimer: boolean;
    timerSeconds: number;
  },
  store: { accessToken: string },
  storeHash: string,
) {
  // Fetch product details from BigCommerce
  let product = null;
  try {
    const client = createBCClient(storeHash, store.accessToken);
    const productResponse = await client.getProduct(offer.upsellProductId);
    const p = productResponse.data;

    let finalPrice = p.sale_price || p.price;
    if (offer.discountType === 'percentage' && offer.discountValue) {
      finalPrice = finalPrice * (1 - offer.discountValue / 100);
    } else if (offer.discountType === 'fixed' && offer.discountValue) {
      finalPrice = Math.max(0, finalPrice - offer.discountValue);
    }

    const thumbnailImage = p.images?.find((img) => img.is_thumbnail) || p.images?.[0];

    product = {
      id: p.id,
      name: p.name,
      originalPrice: p.sale_price || p.price,
      finalPrice: Math.round(finalPrice * 100) / 100,
      image: thumbnailImage?.url_standard || null,
      description: p.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
    };
  } catch {
    // If product fetch fails, return offer without product details
  }

  return NextResponse.json({
    data: {
      offerId: offer.id,
      title: offer.title,
      description: offer.description,
      ctaText: offer.ctaText,
      declineText: offer.declineText,
      showTimer: offer.showTimer,
      timerSeconds: offer.timerSeconds,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      product,
    },
  });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
