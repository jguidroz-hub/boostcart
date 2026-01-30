import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support — BoostCart',
  description: 'Get help with BoostCart. FAQs, contact info, and resources.',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Support</h1>
        <p className="text-gray-500 mb-10">
          Need help with BoostCart? We&apos;re here for you.
        </p>

        {/* Contact */}
        <section className="mb-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">📧 Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            Email us at{' '}
            <a href="mailto:support@boostcart.io" className="text-blue-600 font-medium hover:underline">
              support@boostcart.io
            </a>{' '}
            and we&apos;ll get back to you within 24 hours.
          </p>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="/dashboard"
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">📊 Dashboard</div>
              <div className="text-sm text-gray-500 mt-1">View your offers and analytics</div>
            </a>
            <a
              href="/offers/new"
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">➕ Create Offer</div>
              <div className="text-sm text-gray-500 mt-1">Set up a new upsell offer</div>
            </a>
            <a
              href="/analytics"
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">📈 Analytics</div>
              <div className="text-sm text-gray-500 mt-1">Track your upsell performance</div>
            </a>
            <a
              href="/privacy"
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">🔒 Privacy Policy</div>
              <div className="text-sm text-gray-500 mt-1">How we handle your data</div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How do I install BoostCart?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Install BoostCart directly from the{' '}
                <a
                  href="https://www.bigcommerce.com/apps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BigCommerce App Marketplace
                </a>
                . Click &quot;Install&quot;, authorize the app, and you&apos;re ready to go. The whole
                process takes less than a minute.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How do I create an upsell offer?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                From your{' '}
                <a href="/dashboard" className="text-blue-600 hover:underline">dashboard</a>,
                click &quot;Create Offer.&quot; Choose the product you want to upsell, set your discount
                (if any), configure targeting rules, and activate it. Your offer will start appearing
                to customers on the order confirmation page.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How do I track performance?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Head to the{' '}
                <a href="/analytics" className="text-blue-600 hover:underline">Analytics</a>{' '}
                page to see your upsell metrics — impressions, clicks, conversions, and revenue
                generated. You can filter by date range and see which offers perform best.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What happens when a customer accepts an upsell?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                When a customer clicks &quot;Add to Order&quot; on a post-purchase upsell, the item is
                added to their existing order. No need to re-enter payment details — it&apos;s a
                seamless one-click experience powered by BigCommerce&apos;s checkout.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Is BoostCart free?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                BoostCart currently offers a free tier to get you started. We plan to introduce paid
                tiers with advanced features in the future. We&apos;ll always give you plenty of notice
                before any pricing changes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How do I uninstall BoostCart?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                You can uninstall BoostCart anytime from your BigCommerce control panel under
                Apps → My Apps. Your data will be deleted within 30 days of uninstallation, or you
                can request immediate deletion by emailing us.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I customize how the upsell looks?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Yes! BoostCart&apos;s upsell widget is designed to match your store&apos;s look and feel.
                You can customize colors, text, and layout from the offer editor to ensure a seamless
                brand experience.
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-700 mb-3">
            Still have questions? We&apos;d love to hear from you.
          </p>
          <a
            href="mailto:support@boostcart.io"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Email Support
          </a>
        </section>
      </div>
    </main>
  );
}
