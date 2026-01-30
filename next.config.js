/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow BigCommerce to embed our app in an iframe
  async headers() {
    return [
      {
        // Widget API routes — allow cross-origin from any storefront
        source: '/api/widget/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Widget JS — allow loading from any storefront
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=600' },
        ],
      },
      {
        // Allow BigCommerce admin to iframe our app
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.bigcommerce.com https://store-*.mybigcommerce.com;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
