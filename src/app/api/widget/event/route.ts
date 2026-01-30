/**
 * POST /api/widget/event
 * 
 * Track upsell widget events: shown, declined, timeout.
 * Called by the storefront widget for analytics tracking.
 * 
 * Body:
 *   - storeHash: BC store hash
 *   - offerId: BoostCart offer ID
 *   - orderId: BC order ID
 *   - action: "shown" | "declined" | "timeout"
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveStore } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeHash, offerId, orderId, action } = body;

    if (!storeHash || !offerId || !orderId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate action type
    if (!['shown', 'declined', 'timeout'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: shown, declined, or timeout' },
        { status: 400 },
      );
    }

    // Verify store
    const store = await getActiveStore(storeHash);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify offer exists
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, storeId: store.id },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Create event record
    await prisma.upsellEvent.create({
      data: {
        storeId: store.id,
        offerId,
        orderId: parseInt(orderId),
        action,
        revenue: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/widget/event error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
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
