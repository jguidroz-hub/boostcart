import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-bold text-white">BoostCart</span>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2 bg-white text-blue-900 font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          Open Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          First post-purchase upsell app for BigCommerce
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Increase AOV by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            10-30%
          </span>
          <br />
          with one click
        </h1>

        <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
          Show targeted upsell offers on your order confirmation page.
          Customers accept with one click — no re-entering payment info.
          Works with every BigCommerce theme.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-500 text-white font-semibold text-lg rounded-xl hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25"
          >
            Start Free Trial →
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 text-blue-200 font-medium text-lg hover:text-white transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-white text-center mb-16">
          How BoostCart Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Install in 60 seconds',
              description:
                'One-click install from the BigCommerce App Marketplace. No theme editing. No developer needed.',
              icon: '⚡',
            },
            {
              step: '2',
              title: 'Create upsell offers',
              description:
                'Choose trigger products, set discount rules, customize the offer card. Our builder makes it simple.',
              icon: '🎯',
            },
            {
              step: '3',
              title: 'Watch revenue grow',
              description:
                'Customers see targeted offers after purchase and accept with one click. Track conversions in real-time.',
              icon: '📈',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-blue-400 text-sm font-medium mb-2">Step {item.step}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-blue-200">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Everything you need to boost revenue
        </h2>
        <p className="text-blue-200 text-center mb-16 max-w-2xl mx-auto">
          Built specifically for BigCommerce merchants. No compromises.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Post-Purchase Upsells', desc: 'Show offers on the order confirmation page when buying intent is highest.', icon: '🛍️' },
            { title: 'One-Click Accept', desc: 'Customers add to their order with a single click. No re-entering payment.', icon: '👆' },
            { title: 'Smart Targeting', desc: 'Trigger offers based on products purchased, categories, or any order.', icon: '🎯' },
            { title: 'Countdown Timers', desc: 'Create urgency with configurable countdown timers on offers.', icon: '⏱️' },
            { title: 'Discount Controls', desc: 'Offer percentage or fixed discounts to increase conversion rates.', icon: '💰' },
            { title: 'Real-Time Analytics', desc: 'Track impressions, conversions, and revenue in your dashboard.', icon: '📊' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-blue-200 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-blue-200 text-center mb-16">14-day free trial on all plans. No credit card required.</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '$29',
              features: ['Up to 200 orders/mo', '3 active offers', 'Post-purchase upsells', 'Basic analytics'],
              popular: false,
            },
            {
              name: 'Growth',
              price: '$49',
              features: ['Up to 1,000 orders/mo', 'Unlimited offers', 'All upsell types', 'Advanced analytics', 'Priority support'],
              popular: true,
            },
            {
              name: 'Pro',
              price: '$99',
              features: ['Up to 5,000 orders/mo', 'Everything in Growth', 'A/B testing', 'AI recommendations', 'Dedicated support'],
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-blue-500 border-2 border-blue-400 scale-105'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-blue-200">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-blue-100 text-sm">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-white text-blue-600 hover:bg-blue-50'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                Start Free Trial
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <span className="text-white font-semibold">BoostCart</span>
          </div>
          <p className="text-blue-300 text-sm">
            © {new Date().getFullYear()} BoostCart. Built for BigCommerce merchants.
          </p>
        </div>
      </footer>
    </div>
  );
}
