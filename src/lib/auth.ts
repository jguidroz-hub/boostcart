/**
 * Auth utilities for BigCommerce app authentication.
 * Handles JWT verification for load/uninstall callbacks and session management.
 */

import * as jose from 'jose';
import { prisma } from './db';

const BC_CLIENT_ID = process.env.BC_CLIENT_ID!;
const BC_CLIENT_SECRET = process.env.BC_CLIENT_SECRET!;

export interface BCJwtPayload {
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  jti: string;
  sub: string;
  user: {
    id: number;
    email: string;
    locale: string;
  };
  owner: {
    id: number;
    email: string;
  };
  url: string;
  channel_id: number | null;
}

/**
 * Verify the signed_payload_jwt from BigCommerce load/uninstall callbacks.
 * BigCommerce signs these with our client secret using HS256.
 */
export async function verifyBCJwt(signedPayload: string): Promise<BCJwtPayload> {
  const secret = new TextEncoder().encode(BC_CLIENT_SECRET);

  const { payload } = await jose.jwtVerify(signedPayload, secret, {
    algorithms: ['HS256'],
    audience: BC_CLIENT_ID,
  });

  return payload as unknown as BCJwtPayload;
}

/**
 * Extract store hash from the JWT `sub` field.
 * Format: "stores/{storeHash}"
 */
export function extractStoreHash(sub: string): string {
  const parts = sub.split('/');
  if (parts.length !== 2 || parts[0] !== 'stores') {
    throw new Error(`Invalid JWT subject: ${sub}`);
  }
  return parts[1];
}

/**
 * Get or create a store session from a verified JWT payload.
 */
export async function getStoreFromJwt(payload: BCJwtPayload) {
  const storeHash = extractStoreHash(payload.sub);

  const store = await prisma.store.findUnique({
    where: { storeHash },
  });

  if (!store || !store.isActive) {
    throw new Error(`Store not found or inactive: ${storeHash}`);
  }

  return { store, storeHash, user: payload.user };
}

/**
 * Verify the store hash from a simple query parameter (for widget API calls).
 * Returns the store if it exists and is active.
 */
export async function getActiveStore(storeHash: string) {
  const store = await prisma.store.findUnique({
    where: { storeHash },
  });

  if (!store || !store.isActive) {
    return null;
  }

  return store;
}

/**
 * Simple session token for dashboard access.
 * Creates a JWT signed with our client secret.
 */
export async function createSessionToken(storeHash: string, userId: number): Promise<string> {
  const secret = new TextEncoder().encode(BC_CLIENT_SECRET);

  return new jose.SignJWT({ storeHash, userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);
}

/**
 * Verify a session token from our dashboard cookies.
 */
export async function verifySessionToken(token: string): Promise<{ storeHash: string; userId: number }> {
  const secret = new TextEncoder().encode(BC_CLIENT_SECRET);

  const { payload } = await jose.jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });

  return {
    storeHash: payload.storeHash as string,
    userId: payload.userId as number,
  };
}

/**
 * Get store from session cookie (for dashboard pages).
 */
export async function getStoreFromSession(cookieValue: string | undefined) {
  if (!cookieValue) return null;

  try {
    const { storeHash } = await verifySessionToken(cookieValue);
    return prisma.store.findUnique({ where: { storeHash } });
  } catch {
    return null;
  }
}
