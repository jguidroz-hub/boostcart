'use client';

import React from 'react';
import Link from 'next/link';
import OfferForm from '@/components/offer-form';

export default function NewOfferPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl font-bold text-gray-900">BoostCart</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/offers" className="text-sm font-medium text-blue-600">
              Offers
            </Link>
            <Link href="/analytics" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/offers" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Offers
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create New Offer</h2>
          <p className="text-gray-500 mt-1">
            Set up a new upsell offer to increase your average order value.
          </p>
        </div>

        <OfferForm />
      </main>
    </div>
  );
}
