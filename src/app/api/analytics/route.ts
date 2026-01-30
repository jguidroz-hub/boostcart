/**
 * GET /api/analytics
 * 
 * Analytics data for the merchant dashboard.
 * Returns aggregated upsell event data: impressions, conversions, revenue.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStoreFromSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('bc_session')?.value;
    const store = await getStoreFromSession(session);

    if (!store) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate stats
    const [totalStats, dailyStats, offerStats, recentEvents] = await Promise.all([
      // Overall totals
      prisma.upsellEvent.groupBy({
        by: ['action'],
        where: {
          storeId: store.id,
          createdAt: { gte: startDate },
        },
        _count: { action: true },
        _sum: { revenue: true },
      }),

      // Daily breakdown
      prisma.$queryRaw<Array<{ date: string; action: string; count: bigint; revenue: number }>>`
        SELECT
          DATE(created_at) as date,
          action,
          COUNT(*) as count,
          COALESCE(SUM(revenue), 0) as revenue
        FROM "UpsellEvent"
        WHERE store_id = ${store.id}
          AND created_at >= ${startDate}
        GROUP BY DATE(created_at), action
        ORDER BY date ASC
      `,

      // Per-offer breakdown
      prisma.upsellEvent.groupBy({
        by: ['offerId', 'action'],
        where: {
          storeId: store.id,
          createdAt: { gte: startDate },
        },
        _count: { action: true },
        _sum: { revenue: true },
      }),

      // Recent events
      prisma.upsellEvent.findMany({
        where: {
          storeId: store.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          offer: { select: { name: true, title: true } },
        },
      }),
    ]);

    // Calculate summary metrics
    const shown = totalStats.find((s) => s.action === 'shown')?._count.action || 0;
    const accepted = totalStats.find((s) => s.action === 'accepted')?._count.action || 0;
    const declined = totalStats.find((s) => s.action === 'declined')?._count.action || 0;
    const timedOut = totalStats.find((s) => s.action === 'timeout')?._count.action || 0;
    const totalRevenue = totalStats.find((s) => s.action === 'accepted')?._sum.revenue || 0;

    const summary = {
      shown,
      accepted,
      declined,
      timedOut,
      totalRevenue,
      conversionRate: shown > 0 ? ((accepted / shown) * 100).toFixed(1) : '0.0',
      averageOrderValue: accepted > 0 ? (Number(totalRevenue) / accepted).toFixed(2) : '0.00',
    };

    // Transform daily stats for charting
    const dailyMap = new Map<string, { shown: number; accepted: number; declined: number; revenue: number }>();
    for (const row of dailyStats) {
      const dateStr = String(row.date).split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { shown: 0, accepted: 0, declined: 0, revenue: 0 });
      }
      const day = dailyMap.get(dateStr)!;
      if (row.action === 'shown') day.shown = Number(row.count);
      if (row.action === 'accepted') {
        day.accepted = Number(row.count);
        day.revenue = Number(row.revenue);
      }
      if (row.action === 'declined') day.declined = Number(row.count);
    }

    const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    return NextResponse.json({
      summary,
      daily,
      offerStats,
      recentEvents,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
