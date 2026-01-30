'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OfferFormData {
  id?: string;
  name: string;
  type: string;
  triggerType: string;
  triggerIds: string[];
  upsellProductId: string;
  discountType: string;
  discountValue: string;
  title: string;
  description: string;
  ctaText: string;
  declineText: string;
  priority: number;
  showTimer: boolean;
  timerSeconds: number;
  status: string;
}

interface OfferFormProps {
  initialData?: Partial<OfferFormData>;
  isEditing?: boolean;
}

const DEFAULT_DATA: OfferFormData = {
  name: '',
  type: 'post_purchase',
  triggerType: 'any',
  triggerIds: [],
  upsellProductId: '',
  discountType: '',
  discountValue: '',
  title: '',
  description: '',
  ctaText: 'Add to Order',
  declineText: 'No thanks',
  priority: 0,
  showTimer: true,
  timerSeconds: 300,
  status: 'active',
};

export default function OfferForm({ initialData, isEditing }: OfferFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<OfferFormData>({ ...DEFAULT_DATA, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggerIdsText, setTriggerIdsText] = useState(form.triggerIds.join(', '));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        triggerIds: triggerIdsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        upsellProductId: parseInt(form.upsellProductId),
        discountValue: form.discountValue ? parseFloat(form.discountValue) : null,
        discountType: form.discountType || null,
      };

      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch('/api/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save offer');
      }

      router.push('/offers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ──── Basic Info ──── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g., Premium Upgrade Offer"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Internal name — not shown to customers</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="post_purchase">Post-Purchase (Order Confirmation)</option>
              <option value="in_cart">In-Cart (Cart Page)</option>
              <option value="thank_you">Thank You Page</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              min={0}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Higher priority offers are shown first</p>
          </div>
        </div>
      </div>

      {/* ──── Trigger Rules ──── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Rules</h3>
        <p className="text-sm text-gray-500 mb-4">
          Define when this upsell offer should be shown based on what was purchased.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Type <span className="text-red-500">*</span>
            </label>
            <select
              name="triggerType"
              value={form.triggerType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any Purchase (show for all orders)</option>
              <option value="product">Specific Products</option>
              <option value="category">Specific Categories</option>
            </select>
          </div>

          {form.triggerType !== 'any' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.triggerType === 'product' ? 'Product IDs' : 'Category IDs'}
              </label>
              <input
                type="text"
                value={triggerIdsText}
                onChange={(e) => setTriggerIdsText(e.target.value)}
                placeholder="e.g., 123, 456, 789"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Comma-separated BigCommerce {form.triggerType} IDs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ──── Upsell Product ──── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upsell Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="upsellProductId"
              value={form.upsellProductId}
              onChange={handleChange}
              required
              placeholder="BigCommerce Product ID"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Discount</option>
              <option value="percentage">Percentage Off</option>
              <option value="fixed">Fixed Amount Off</option>
            </select>
          </div>

          {form.discountType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder={form.discountType === 'percentage' ? 'e.g., 15' : 'e.g., 5.00'}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.discountType === 'percentage' ? 'Percentage (0-100)' : 'Amount in dollars'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ──── Display Settings ──── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g., Wait! Add this to your order..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Headline shown to the customer</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description explaining the offer value..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input
              type="text"
              name="ctaText"
              value={form.ctaText}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decline Button Text
            </label>
            <input
              type="text"
              name="declineText"
              value={form.declineText}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="showTimer"
              checked={form.showTimer}
              onChange={handleChange}
              id="showTimer"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showTimer" className="text-sm font-medium text-gray-700">
              Show countdown timer (urgency)
            </label>
          </div>

          {form.showTimer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timer Duration (seconds)
              </label>
              <input
                type="number"
                name="timerSeconds"
                value={form.timerSeconds}
                onChange={handleChange}
                min={30}
                max={3600}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                {Math.floor(form.timerSeconds / 60)}m {form.timerSeconds % 60}s countdown
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ──── Actions ──── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/offers')}
          className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Offer' : 'Create Offer'}
        </button>
      </div>
    </form>
  );
}
