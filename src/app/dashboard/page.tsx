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

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offerCount, setOfferCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics?days=30').then((r) => r.json()),
      fetch('/api/offers').then((r) => r.json()),
    ])
      .then(([analyticsData, offersData]) => {
        setAnalytics(analyticsData);
        setOfferCount(offersData.data?.length || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || DEFAULT_SUMMARY;

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
            <Link href="/dashboard" className="text-sm font-medium text-blue-600">
              Dashboard
            </Link>
            <Link href="/offers" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Offers
            </Link>
            <Link href="/analytics" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome + Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">Last 30 days overview</p>
          </div>
          <Link
            href="/offers/new"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Offer
          </Link>
        </div>

        {/* Stats Cards */}
        <DashboardStats summary={summary} />

        {/* Quick Setup (show if no offers) */}
        {offerCount === 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get started in 3 steps
                </h3>
                <ol className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <Link href="/offers/new" className="text-blue-600 hover:underline font-medium">
                      Create your first upsell offer
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    Choose which products trigger the offer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    Watch upsell revenue roll in on this dashboard
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AnalyticsChart data={analytics?.daily || []} metric="conversions" />
          <AnalyticsChart data={analytics?.daily || []} metric="revenue" />
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {(!analytics?.recentEvents || analytics.recentEvents.length === 0) ? (
            <p className="text-gray-400 text-center py-8">
              No activity yet. Create an offer to start tracking.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.recentEvents.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        event.action === 'accepted'
                          ? 'bg-green-500'
                          : event.action === 'declined'
                            ? 'bg-red-400'
                            : event.action === 'shown'
                              ? 'bg-blue-400'
                              : 'bg-gray-400'
                      }`}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {event.action}
                      </span>
                      <span className="text-sm text-gray-500">
                        {' '}— {event.offer.name} (Order #{event.orderId})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {event.revenue && (
                      <span className="text-sm font-medium text-green-600">
                        +${event.revenue.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(event.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
