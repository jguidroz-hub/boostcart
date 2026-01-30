/**
 * BigCommerce Scripts API helpers.
 * Manages widget.js injection into storefront pages.
 */

import { createBCClient } from './bigcommerce';

const WIDGET_SCRIPT_NAME = 'BoostCart Upsell Widget';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Install the upsell widget script on a store's storefront.
 * This injects widget.js into the order confirmation page via the Scripts API.
 */
export async function installWidgetScript(storeHash: string, accessToken: string): Promise<void> {
  const client = createBCClient(storeHash, accessToken);

  // First, clean up any existing BoostCart scripts
  try {
    const existingScripts = await client.getScripts();
    for (const script of existingScripts.data) {
      if (script.name === WIDGET_SCRIPT_NAME) {
        await client.deleteScript(script.uuid);
      }
    }
  } catch {
    // Ignore errors on cleanup — might not have any scripts yet
  }

  // Install the widget script on order confirmation page
  await client.createScript({
    name: WIDGET_SCRIPT_NAME,
    description: 'BoostCart post-purchase upsell offers on order confirmation page',
    src: `${APP_URL}/widget.js`,
    auto_uninstall: true,
    load_method: 'default',
    location: 'footer',
    visibility: 'order_confirmation',
    kind: 'src',
    consent_category: 'functional',
  });
}

/**
 * Remove the upsell widget script from a store.
 */
export async function removeWidgetScript(storeHash: string, accessToken: string): Promise<void> {
  const client = createBCClient(storeHash, accessToken);

  try {
    const existingScripts = await client.getScripts();
    for (const script of existingScripts.data) {
      if (script.name === WIDGET_SCRIPT_NAME) {
        await client.deleteScript(script.uuid);
      }
    }
  } catch {
    // Best effort cleanup
  }
}

/**
 * Register webhooks needed for the app to function.
 */
export async function registerWebhooks(storeHash: string, accessToken: string): Promise<void> {
  const client = createBCClient(storeHash, accessToken);
  const webhookSecret = process.env.WEBHOOK_SECRET || 'boostcart-webhook-secret';

  const webhooks = [
    {
      scope: 'store/order/created',
      destination: `${APP_URL}/api/webhooks/order-created`,
    },
    {
      scope: 'store/app/uninstalled',
      destination: `${APP_URL}/api/auth/uninstall`,
    },
  ];

  for (const hook of webhooks) {
    try {
      await client.createWebhook({
        ...hook,
        is_active: true,
        headers: { 'X-BoostCart-Secret': webhookSecret },
      });
    } catch {
      // Webhook might already exist — that's fine
    }
  }
}
