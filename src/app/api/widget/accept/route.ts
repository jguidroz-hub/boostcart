/**
 * POST /api/widget/accept
 * 
 * Process an accepted upsell offer.
 * Creates a new order via BigCommerce Orders V2 API.
 * Attempts stored payment instrument, falls back to checkout redirect.
 * 
 * Body:
 *   - storeHash: BC store hash
 *   - offerId: BoostCart offer ID
 *   - orderId: Original BC order ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveStore } from '@/lib/auth';
import { createBCClient } from '@/lib/bigcommerce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeHash, offerId, orderId } = body;

    if (!storeHash || !offerId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: storeHash, offerId, orderId' },
        { status: 400 },
      );
    }

    // Verify store
    const store = await getActiveStore(storeHash);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get the offer
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, storeId: store.id, status: 'active' },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found or inactive' }, { status: 404 });
    }

    const client = createBCClient(storeHash, store.accessToken);

    // Get original order details (for customer/shipping info)
    const originalOrder = await client.getOrder(parseInt(orderId));

    // Calculate the upsell price
    const productResponse = await client.getProduct(offer.upsellProductId);
    const product = productResponse.data;
    let upsellPrice = product.sale_price || product.price;

    if (offer.discountType === 'percentage' && offer.discountValue) {
      upsellPrice = upsellPrice * (1 - offer.discountValue / 100);
    } else if (offer.discountType === 'fixed' && offer.discountValue) {
      upsellPrice = Math.max(0, upsellPrice - offer.discountValue);
    }

    upsellPrice = Math.round(upsellPrice * 100) / 100;

    // Try to create a new order via Orders V2 API
    let upsellOrder = null;
    let paymentStatus = 'pending';

    try {
      upsellOrder = await client.createOrder({
        customer_id: originalOrder.customer_id,
        billing_address: originalOrder.billing_address,
        products: [
          {
            product_id: offer.upsellProductId,
            quantity: 1,
            price_inc_tax: upsellPrice,
            price_ex_tax: upsellPrice,
          },
        ],
        status_id: 1, // Pending
        staff_notes: `BoostCart Upsell — linked to Order #${orderId}`,
        customer_message: '',
      });

      // Attempt payment via stored instrument
      try {
        const paymentToken = await client.createPaymentAccessToken(upsellOrder.id);
        if (paymentToken) {
          // Payment token obtained — in production, process with stored card
          // For MVP, we mark as successful and the merchant handles payment
          paymentStatus = 'token_created';
        }
      } catch {
        // No stored payment instrument — order stays pending
        paymentStatus = 'pending';
      }
    } catch (orderError) {
      console.error('Failed to create upsell order:', orderError);

      // Fallback: Create a cart with the upsell product for quick checkout
      try {
        const cart = await client.createCart({
          customer_id: originalOrder.customer_id,
          line_items: [
            {
              product_id: offer.upsellProductId,
              quantity: 1,
            },
          ],
        });

        // Track the acceptance even though we couldn't create an order
        await prisma.upsellEvent.create({
          data: {
            storeId: store.id,
            offerId: offer.id,
            orderId: parseInt(orderId),
            action: 'accepted',
            revenue: upsellPrice,
          },
        });

        return NextResponse.json({
          success: true,
          method: 'cart_redirect',
          cartId: (cart as { data?: { id?: string } }).data?.id,
          checkoutUrl: store.storeUrl
            ? `${store.storeUrl}/cart.php?action=add&product_id=${offer.upsellProductId}`
            : null,
          message: 'Item added to cart. Redirecting to checkout...',
        });
      } catch {
        return NextResponse.json(
          { error: 'Failed to process upsell' },
          { status: 500 },
        );
      }
    }

    // Track the accepted event
    await prisma.upsellEvent.create({
      data: {
        storeId: store.id,
        offerId: offer.id,
        orderId: parseInt(orderId),
        action: 'accepted',
        revenue: upsellPrice,
      },
    });

    return NextResponse.json({
      success: true,
      method: 'new_order',
      upsellOrderId: upsellOrder?.id,
      paymentStatus,
      revenue: upsellPrice,
      message: 'Upsell added successfully!',
    });
  } catch (error) {
    console.error('POST /api/widget/accept error:', error);
    return NextResponse.json(
      { error: 'Failed to process upsell acceptance' },
      { status: 500 },
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
