/**
 * GET /api/auth/uninstall
 * 
 * BigCommerce Uninstall callback.
 * Called when a merchant uninstalls the app. Cleans up scripts and marks store inactive.
 * Note: Widget scripts are auto-removed by BC when auto_uninstall=true.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyBCJwt, extractStoreHash } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const signedPayload = searchParams.get('signed_payload_jwt');

    if (!signedPayload) {
      return NextResponse.json(
        { error: 'Missing signed_payload_jwt' },
        { status: 400 },
      );
    }

    const payload = await verifyBCJwt(signedPayload);
    const storeHash = extractStoreHash(payload.sub);

    // Mark store as uninstalled (don't delete — they might reinstall)
    await prisma.store.update({
      where: { storeHash },
      data: {
        isActive: false,
        uninstalledAt: new Date(),
      },
    });

    // Pause all active offers
    const store = await prisma.store.findUnique({ where: { storeHash } });
    if (store) {
      await prisma.offer.updateMany({
        where: { storeId: store.id, status: 'active' },
        data: { status: 'paused' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Uninstall error:', error);
    // Always return 200 to BigCommerce even on error
    return NextResponse.json({ success: true });
  }
}
