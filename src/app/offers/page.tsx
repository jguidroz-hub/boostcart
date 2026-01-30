'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import OfferList from '@/components/offer-list';

interface OfferWithStats {
  id: string;
  name: string;
  type: string;
  status: string;
  title: string;
  upsellProductId: number;
  triggerType: string;
  discountType: string | null;
  discountValue: number | null;
  createdAt: string;
  stats: {
    shown: number;
    accepted: number;
    declined: number;
    revenue: number;
    conversionRate: string;
  };
}

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      setOffers(data.data || []);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchOffers();
    } catch (err) {
      console.error('Failed to toggle offer status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/offers?id=${id}`, { method: 'DELETE' });
      fetchOffers();
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upsell Offers</h2>
            <p className="text-gray-500 mt-1">
              {offers.length} offer{offers.length !== 1 ? 's' : ''} configured
            </p>
          </div>
          <Link
            href="/offers/new"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Offer
          </Link>
        </div>

        <OfferList
          offers={offers}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
