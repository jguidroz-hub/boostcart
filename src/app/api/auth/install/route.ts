/**
 * POST /api/auth/install
 * 
 * BigCommerce OAuth install callback.
 * Called when a merchant clicks "Install" in the BC App Marketplace.
 * Receives auth code, exchanges for permanent access token, stores in DB.
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

    // Extract store hash from context ("stores/{hash}")
    const storeHash = context.split('/')[1];
    if (!storeHash) {
      return NextResponse.json(
        { error: 'Invalid context parameter' },
        { status: 400 },
      );
    }

    // Exchange authorization code for permanent access token
    const tokenResponse = await exchangeToken(code, context, scope);

    // Upsert store record — handles reinstalls
    const store = await prisma.store.upsert({
      where: { storeHash },
      update: {
        accessToken: tokenResponse.access_token,
        ownerEmail: tokenResponse.user.email,
        isActive: true,
        uninstalledAt: null,
        installedAt: new Date(),
      },
      create: {
        storeHash,
        accessToken: tokenResponse.access_token,
        ownerEmail: tokenResponse.user.email,
        plan: 'free_trial',
      },
    });

    // Install widget script on storefront via Scripts API
    await installWidgetScript(storeHash, tokenResponse.access_token);

    // Register webhooks
    await registerWebhooks(storeHash, tokenResponse.access_token);

    // Fetch and store store name
    try {
      const storeInfoResp = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/store`,
        {
          headers: {
            'X-Auth-Token': tokenResponse.access_token,
            Accept: 'application/json',
          },
        },
      );
      if (storeInfoResp.ok) {
        const storeInfo = await storeInfoResp.json();
        await prisma.store.update({
          where: { id: store.id },
          data: {
            storeName: storeInfo.name,
            storeUrl: storeInfo.secure_url || storeInfo.domain,
          },
        });
      }
    } catch {
      // Non-critical — store name fetch failed
    }

    // Create session and redirect to dashboard
    const sessionToken = await createSessionToken(storeHash, tokenResponse.user.id);
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set('bc_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Required for BC iframe
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Install error:', error);
    return NextResponse.json(
      { error: 'Installation failed', details: String(error) },
      { status: 500 },
    );
  }
}
