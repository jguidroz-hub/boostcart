'use client';

import React from 'react';
import Link from 'next/link';

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

interface OfferListProps {
  offers: OfferWithStats[];
  onToggleStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  post_purchase: { label: 'Post-Purchase', color: 'bg-purple-100 text-purple-700' },
  in_cart: { label: 'In-Cart', color: 'bg-blue-100 text-blue-700' },
  thank_you: { label: 'Thank You', color: 'bg-green-100 text-green-700' },
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-500',
};

export default function OfferList({ offers, onToggleStatus, onDelete }: OfferListProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No upsell offers yet</h3>
        <p className="text-gray-500 mb-6">
          Create your first offer to start increasing your average order value.
        </p>
        <Link
          href="/offers/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Your First Offer
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Offer
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Type
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Status
            </th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Shown
            </th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Conv.
            </th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Revenue
            </th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {offers.map((offer) => {
            const typeInfo = TYPE_LABELS[offer.type] || { label: offer.type, color: 'bg-gray-100 text-gray-700' };
            return (
              <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <Link
                      href={`/offers/${offer.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {offer.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{offer.title}</p>
                    {offer.discountType && (
                      <span className="text-xs text-orange-600">
                        {offer.discountType === 'percentage'
                          ? `${offer.discountValue}% off`
                          : `$${offer.discountValue} off`}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[offer.status] || ''}`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">
                  {offer.stats.shown.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {offer.stats.conversionRate}%
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                  ${Number(offer.stats.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        onToggleStatus(
                          offer.id,
                          offer.status === 'active' ? 'paused' : 'active',
                        )
                      }
                      className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {offer.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <Link
                      href={`/offers/${offer.id}`}
                      className="text-xs px-3 py-1.5 rounded-md border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this offer? This cannot be undone.')) {
                          onDelete(offer.id);
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
