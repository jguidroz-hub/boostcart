/**
 * /api/offers
 * 
 * CRUD API for upsell offers.
 * GET  — List all offers for the authenticated store
 * POST — Create a new offer
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStoreFromSession } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAuthenticatedStore() {
  const cookieStore = cookies();
  const session = cookieStore.get('bc_session')?.value;
  const store = await getStoreFromSession(session);
  if (!store) {
    throw new Error('Unauthorized');
  }
  return store;
}

export async function GET() {
  try {
    const store = await getAuthenticatedStore();

    const offers = await prisma.offer.findMany({
      where: { storeId: store.id },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    // Enrich with stats
    const offersWithStats = await Promise.all(
      offers.map(async (offer) => {
        const stats = await prisma.upsellEvent.groupBy({
          by: ['action'],
          where: { offerId: offer.id },
          _count: { action: true },
          _sum: { revenue: true },
        });

        const shown = stats.find((s) => s.action === 'shown')?._count.action || 0;
        const accepted = stats.find((s) => s.action === 'accepted')?._count.action || 0;
        const declined = stats.find((s) => s.action === 'declined')?._count.action || 0;
        const revenue = stats.find((s) => s.action === 'accepted')?._sum.revenue || 0;

        return {
          ...offer,
          stats: {
            shown,
            accepted,
            declined,
            revenue,
            conversionRate: shown > 0 ? ((accepted / shown) * 100).toFixed(1) : '0.0',
          },
        };
      }),
    );

    return NextResponse.json({ data: offersWithStats });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/offers error:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const store = await getAuthenticatedStore();
    const body = await request.json();

    // Validate required fields
    const { name, type, triggerType, upsellProductId, title } = body;
    if (!name || !type || !triggerType || !upsellProductId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, triggerType, upsellProductId, title' },
        { status: 400 },
      );
    }

    // Validate type
    if (!['post_purchase', 'in_cart', 'thank_you'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid offer type. Must be: post_purchase, in_cart, or thank_you' },
        { status: 400 },
      );
    }

    const offer = await prisma.offer.create({
      data: {
        storeId: store.id,
        name,
        type,
        status: body.status || 'active',
        triggerType,
        triggerIds: body.triggerIds || [],
        upsellProductId: parseInt(upsellProductId),
        discountType: body.discountType || null,
        discountValue: body.discountValue ? parseFloat(body.discountValue) : null,
        title,
        description: body.description || null,
        ctaText: body.ctaText || 'Add to Order',
        declineText: body.declineText || 'No thanks',
        priority: body.priority || 0,
        showTimer: body.showTimer !== undefined ? body.showTimer : true,
        timerSeconds: body.timerSeconds || 300,
      },
    });

    return NextResponse.json({ data: offer }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/offers error:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const store = await getAuthenticatedStore();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });
    }

    // Verify offer belongs to this store
    const existing = await prisma.offer.findFirst({
      where: { id: body.id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const offer = await prisma.offer.update({
      where: { id: body.id },
      data: {
        name: body.name,
        type: body.type,
        status: body.status,
        triggerType: body.triggerType,
        triggerIds: body.triggerIds,
        upsellProductId: body.upsellProductId ? parseInt(body.upsellProductId) : undefined,
        discountType: body.discountType,
        discountValue: body.discountValue ? parseFloat(body.discountValue) : undefined,
        title: body.title,
        description: body.description,
        ctaText: body.ctaText,
        declineText: body.declineText,
        priority: body.priority,
        showTimer: body.showTimer,
        timerSeconds: body.timerSeconds,
      },
    });

    return NextResponse.json({ data: offer });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('PUT /api/offers error:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const store = await getAuthenticatedStore();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });
    }

    // Verify offer belongs to this store
    const existing = await prisma.offer.findFirst({
      where: { id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    await prisma.offer.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('DELETE /api/offers error:', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
