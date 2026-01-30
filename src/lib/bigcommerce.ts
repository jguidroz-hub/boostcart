/**
 * BigCommerce API Client
 * Handles all REST API interactions with BigCommerce stores.
 */

const BC_API_BASE = 'https://api.bigcommerce.com';
const BC_LOGIN_URL = 'https://login.bigcommerce.com';

export interface BCOAuthResponse {
  access_token: string;
  scope: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  context: string;
  account_uuid: string;
}

export interface BCProduct {
  id: number;
  name: string;
  type: string;
  sku: string;
  description: string;
  price: number;
  sale_price: number;
  retail_price: number;
  images: Array<{
    id: number;
    url_standard: string;
    url_thumbnail: string;
    is_thumbnail: boolean;
  }>;
  categories: number[];
  availability: string;
  inventory_level: number;
}

export interface BCOrder {
  id: number;
  customer_id: number;
  status_id: number;
  status: string;
  subtotal_ex_tax: string;
  subtotal_inc_tax: string;
  total_ex_tax: string;
  total_inc_tax: string;
  items_total: number;
  currency_code: string;
  billing_address: BCAddress;
  products: { url: string };
}

export interface BCAddress {
  first_name: string;
  last_name: string;
  company?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  country_iso2: string;
  phone?: string;
  email: string;
}

/**
 * Exchange OAuth authorization code for permanent access token.
 */
export async function exchangeToken(
  code: string,
  context: string,
  scope: string,
): Promise<BCOAuthResponse> {
  const response = await fetch(`${BC_LOGIN_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.BC_CLIENT_ID,
      client_secret: process.env.BC_CLIENT_SECRET,
      code,
      context,
      scope,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.APP_URL}/api/auth/callback`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth token exchange failed: ${response.status} — ${error}`);
  }

  return response.json();
}

/**
 * Create an authenticated BigCommerce API client for a specific store.
 */
export function createBCClient(storeHash: string, accessToken: string) {
  const baseUrl = `${BC_API_BASE}/stores/${storeHash}`;

  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`BigCommerce API error [${response.status}] ${path}: ${error}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return undefined as T;

    return response.json();
  }

  return {
    // ──── Products ────
    async getProducts(params?: Record<string, string>): Promise<{ data: BCProduct[] }> {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/v3/catalog/products${query}`);
    },

    async getProduct(productId: number): Promise<{ data: BCProduct }> {
      return request(`/v3/catalog/products/${productId}?include=images`);
    },

    // ──── Orders ────
    async getOrder(orderId: number): Promise<BCOrder> {
      return request(`/v2/orders/${orderId}`);
    },

    async getOrderProducts(orderId: number): Promise<Array<{ product_id: number; name: string; quantity: number; price_inc_tax: string }>> {
      return request(`/v2/orders/${orderId}/products`);
    },

    async createOrder(orderData: Record<string, unknown>): Promise<BCOrder> {
      return request('/v2/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    // ──── Carts ────
    async createCart(cartData: Record<string, unknown>) {
      return request('/v3/carts', {
        method: 'POST',
        body: JSON.stringify(cartData),
      });
    },

    // ──── Scripts ────
    async createScript(scriptData: Record<string, unknown>) {
      return request('/v3/content/scripts', {
        method: 'POST',
        body: JSON.stringify(scriptData),
      });
    },

    async getScripts(): Promise<{ data: Array<{ uuid: string; name: string }> }> {
      return request('/v3/content/scripts');
    },

    async deleteScript(uuid: string) {
      return request(`/v3/content/scripts/${uuid}`, { method: 'DELETE' });
    },

    // ──── Webhooks ────
    async createWebhook(webhookData: Record<string, unknown>) {
      return request('/v3/hooks', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      });
    },

    // ──── Store Info ────
    async getStoreInfo(): Promise<Record<string, unknown>> {
      return request('/v2/store');
    },

    // ──── Payments ────
    async createPaymentAccessToken(orderId: number) {
      return request('/v3/payments/access_tokens', {
        method: 'POST',
        body: JSON.stringify({
          order: { id: orderId, is_recurring: false },
        }),
      });
    },

    // Raw request helper for custom endpoints
    request,
  };
}
