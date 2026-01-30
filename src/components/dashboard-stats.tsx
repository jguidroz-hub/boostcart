'use client';

import React from 'react';

interface StatsProps {
  summary: {
    shown: number;
    accepted: number;
    declined: number;
    timedOut: number;
    totalRevenue: number;
    conversionRate: string;
    averageOrderValue: string;
  };
}

function StatCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats({ summary }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Total Revenue"
        value={`$${Number(summary.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext="From accepted upsells"
        color="text-green-600"
      />
      <StatCard
        label="Conversion Rate"
        value={`${summary.conversionRate}%`}
        subtext={`${summary.accepted} accepted of ${summary.shown} shown`}
        color="text-blue-600"
      />
      <StatCard
        label="Offers Shown"
        value={summary.shown.toLocaleString()}
        subtext={`${summary.declined} declined, ${summary.timedOut} timed out`}
        color="text-gray-900"
      />
      <StatCard
        label="Avg. Upsell Value"
        value={`$${summary.averageOrderValue}`}
        subtext="Per accepted upsell"
        color="text-indigo-600"
      />
    </div>
  );
}
