/**
 * GET /api/auth/load
 * 
 * BigCommerce Load callback.
 * Called every time a merchant opens the app from the BC control panel.
 * Receives a signed_payload_jwt that identifies the store and user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyBCJwt, extractStoreHash, createSessionToken } from '@/lib/auth';
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

    // Verify the JWT from BigCommerce
    const payload = await verifyBCJwt(signedPayload);
    const storeHash = extractStoreHash(payload.sub);

    // Verify store exists and is active
    const store = await prisma.store.findUnique({
      where: { storeHash },
    });

    if (!store || !store.isActive) {
      return NextResponse.json(
        { error: 'Store not found or inactive. Please reinstall the app.' },
        { status: 404 },
      );
    }

    // Create session token and redirect to dashboard
    const sessionToken = await createSessionToken(storeHash, payload.user.id);
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set('bc_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json(
      { error: 'Failed to load app' },
      { status: 500 },
    );
  }
}
