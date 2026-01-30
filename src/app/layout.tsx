import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BoostCart — Post-Purchase Upsells for BigCommerce',
  description: 'Increase your average order value with one-click post-purchase upsells. The #1 upsell app for BigCommerce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
