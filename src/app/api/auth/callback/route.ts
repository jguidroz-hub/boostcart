/**
 * GET /api/auth/callback
 * 
 * OAuth callback redirect URI. BigCommerce redirects here after merchant
 * authorizes the app. This is the same as install for single-click apps.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeToken } from '@/lib/bigcommerce';
import { prisma } from '@/lib/db';
import { installWidgetScript, registerWebhooks } from '@/lib/scripts';
import { createSessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const scope = searchParams.get('scope');
    const context = searchParams.get('context');

    if (!code || !scope || !context) {
      return NextResponse.json(
        { error: 'Missing required OAuth parameters' },
        { status: 400 },
      );
    }

    const storeHash = context.split('/')[1];
    if (!storeHash) {
      return NextResponse.json(
        { error: 'Invalid context' },
        { status: 400 },
      );
    }

    // Exchange code for token
    const tokenResponse = await exchangeToken(code, context, scope);

    // Upsert store
    await prisma.store.upsert({
      where: { storeHash },
      update: {
        accessToken: tokenResponse.access_token,
        ownerEmail: tokenResponse.user.email,
        isActive: true,
        uninstalledAt: null,
      },
      create: {
        storeHash,
        accessToken: tokenResponse.access_token,
        ownerEmail: tokenResponse.user.email,
      },
    });

    // Setup storefront integration
    await installWidgetScript(storeHash, tokenResponse.access_token);
    await registerWebhooks(storeHash, tokenResponse.access_token);

    // Create session and redirect
    const sessionToken = await createSessionToken(storeHash, tokenResponse.user.id);
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
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    );
  }
}
