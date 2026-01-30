'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardStats from '@/components/dashboard-stats';
import AnalyticsChart from '@/components/analytics-chart';

interface AnalyticsData {
  summary: {
    shown: number;
    accepted: number;
    declined: number;
    timedOut: number;
    totalRevenue: number;
    conversionRate: string;
    averageOrderValue: string;
  };
  daily: Array<{
    date: string;
    shown: number;
    accepted: number;
    declined: number;
    revenue: number;
  }>;
  recentEvents: Array<{
    id: string;
    action: string;
    orderId: number;
    revenue: number | null;
    createdAt: string;
    offer: { name: string; title: string };
  }>;
}

const DEFAULT_SUMMARY = {
  shown: 0,
  accepted: 0,
  declined: 0,
  timedOut: 0,
  totalRevenue: 0,
  conversionRate: '0.0',
  averageOrderValue: '0.00',
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const summary = analytics?.summary || DEFAULT_SUMMARY;

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
            <Link href="/offers" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Offers
            </Link>
            <Link href="/analytics" className="text-sm font-medium text-blue-600">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-500 mt-1">Track your upsell performance</p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  days === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <DashboardStats summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <AnalyticsChart data={analytics?.daily || []} metric="conversions" />
              <AnalyticsChart data={analytics?.daily || []} metric="revenue" />
            </div>

            {/* Funnel Breakdown */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
              <div className="flex items-end gap-1 h-40">
                {[
                  { label: 'Shown', value: summary.shown, color: 'bg-blue-500' },
                  { label: 'Accepted', value: summary.accepted, color: 'bg-green-500' },
                  { label: 'Declined', value: summary.declined, color: 'bg-red-400' },
                  { label: 'Timed Out', value: summary.timedOut, color: 'bg-gray-400' },
                ].map((bar) => {
                  const maxVal = Math.max(summary.shown, 1);
                  const height = Math.max((bar.value / maxVal) * 100, 4);
                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {bar.value.toLocaleString()}
                      </span>
                      <div
                        className={`w-full rounded-t-lg ${bar.color} transition-all duration-500`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Events Table */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
              {(!analytics?.recentEvents || analytics.recentEvents.length === 0) ? (
                <p className="text-gray-400 text-center py-8">No events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">
                          Time
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">
                          Offer
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">
                          Action
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">
                          Order
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {analytics.recentEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(event.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {event.offer.name}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                event.action === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : event.action === 'declined'
                                    ? 'bg-red-100 text-red-700'
                                    : event.action === 'shown'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {event.action}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-700">#{event.orderId}</td>
                          <td className="py-3 text-sm text-right font-medium text-green-600">
                            {event.revenue ? `$${event.revenue.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
