import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — BoostCart',
  description: 'BoostCart terms of service for BigCommerce merchants.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: June 28, 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. The Service</h2>
            <p className="text-gray-700 leading-relaxed">
              BoostCart (&quot;the Service&quot;) is a post-purchase upsell application for BigCommerce
              stores. It allows merchants to create and manage upsell offers that are presented to
              customers after they complete a purchase. BoostCart is operated by Jon Guidroz
              (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Account &amp; Access</h2>
            <p className="text-gray-700 leading-relaxed">
              To use BoostCart, you must have an active BigCommerce store and install the app through
              the BigCommerce marketplace. By installing, you authorize us to access your store data
              as described in our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
              You are responsible for maintaining the security of your BigCommerce account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              BoostCart currently offers a free tier. Paid tiers with additional features may be
              introduced in the future. We&apos;ll give you advance notice before any pricing changes
              affect your account. You won&apos;t be charged without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. What We Provide</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Post-purchase upsell offer creation and management</li>
              <li>Targeting rules (product-based, category-based, customer groups)</li>
              <li>Analytics and performance tracking</li>
              <li>A customizable upsell widget for your storefront</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. No Revenue Guarantees</h2>
            <p className="text-gray-700 leading-relaxed">
              While BoostCart is designed to help increase your average order value, we make{' '}
              <strong>no guarantees</strong> of specific revenue increases, conversion rates, or
              business outcomes. Results vary based on your products, pricing, customer base, and
              offer configuration. The Service is provided &quot;as is.&quot;
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Ensure your upsell offers comply with applicable laws and regulations</li>
              <li>Don&apos;t use the Service for deceptive or fraudulent purposes</li>
              <li>Keep your account credentials secure</li>
              <li>Maintain accurate store and product information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Abuse, exploit, or interfere with the Service</li>
              <li>Use the Service to distribute malware or harmful content</li>
              <li>Reverse-engineer or attempt to extract the source code</li>
              <li>Violate BigCommerce&apos;s terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              You can uninstall BoostCart at any time through the BigCommerce marketplace. We may
              suspend or terminate your access if you violate these terms, abuse the Service, or
              engage in activity that harms other users. We&apos;ll make reasonable efforts to notify
              you before termination, except in cases of serious abuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, BoostCart and its operator shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, or any loss
              of profits or revenue, whether incurred directly or indirectly, or any loss of data or
              use. Our total liability for any claim arising from the Service shall not exceed the
              amount you paid us in the 12 months prior to the claim (or $100, whichever is greater).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms are governed by the laws of the State of Texas, United States. Any disputes
              arising from these terms or your use of the Service shall be resolved in the courts
              located in Texas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these terms from time to time. Material changes will be communicated via
              email or in-app notification at least 30 days before they take effect. Continued use
              of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Questions about these terms? Email us at{' '}
              <a href="mailto:support@boostcart.io" className="text-blue-600 hover:underline">
                support@boostcart.io
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
