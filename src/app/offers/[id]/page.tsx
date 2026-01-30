'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import OfferForm from '@/components/offer-form';

export default function EditOfferPage() {
  const params = useParams();
  const offerId = params.id as string;
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then((data) => {
        const found = data.data?.find((o: { id: string }) => o.id === offerId);
        setOffer(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [offerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Offer not found</h2>
          <Link href="/offers" className="text-blue-600 hover:underline">
            Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h2 className="text-2xl font-bold text-gray-900">Edit Offer</h2>
        </div>

        <OfferForm initialData={offer} isEditing />
      </main>
    </div>
  );
}
