'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  firstName: string | null;
  notes: string | null;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  paid: '✅ Paid',
  preparing: '👨‍🍳 Preparing',
  ready: '🎉 Ready for Pickup!',
  completed: '✔️ Completed',
  cancelled: '❌ Cancelled',
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://telegramminiapp-production-f419.up.railway.app';
    fetch(`${apiUrl}/api/order/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for status updates (Phase 6 will add real-time)
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-tg-bg">
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--tg-theme-button-color, #3390ec)', borderTopColor: 'transparent' }}
        />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-tg-bg">
        <span className="text-4xl">😕</span>
        <p className="text-tg-text font-semibold">Order not found.</p>
        <button onClick={() => router.push('/')} className="text-tg-link text-sm">← Back to menu</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-tg-bg px-4 py-6 flex flex-col gap-5">
      {/* Confirmation header */}
      <div className="text-center py-6">
        <div className="text-6xl mb-3">
          {order.status === 'ready' ? '🎉' : order.status === 'cancelled' ? '❌' : '✅'}
        </div>
        <h1 className="text-xl font-bold text-tg-text">
          {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Placed!'}
        </h1>
        <p className="text-tg-hint text-sm mt-1">
          Order #{order.id.slice(-6).toUpperCase()}
        </p>
      </div>

      {/* Status */}
      <div
        className="p-4 rounded-2xl text-center"
        style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
      >
        <p className="text-xs text-tg-hint mb-1">Current Status</p>
        <p className="font-bold text-tg-text text-base">
          {STATUS_LABELS[order.status] ?? order.status}
        </p>
      </div>

      {/* Items summary */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
      >
        <h2 className="font-semibold text-sm text-tg-text mb-3">Order Summary</h2>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-tg-text">
                {item.name} × {item.quantity}
              </span>
              <span className="text-tg-hint">{(item.price * item.quantity).toFixed(0)} EGP</span>
            </div>
          ))}
          <div className="border-t border-tg-bg mt-2 pt-2 flex justify-between font-bold text-tg-text text-sm">
            <span>Total</span>
            <span>{order.total.toFixed(0)} EGP</span>
          </div>
        </div>
      </div>

      {/* Payment + notes */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
      >
        <div className="flex justify-between text-sm mb-1">
          <span className="text-tg-hint">Payment</span>
          <span className="text-tg-text font-medium capitalize">
            {order.paymentMethod === 'cash' ? '💵 Cash at Pickup' : '💳 Card'}
          </span>
        </div>
        {order.notes && (
          <div className="flex justify-between text-sm">
            <span className="text-tg-hint">Notes</span>
            <span className="text-tg-text font-medium max-w-[60%] text-right">{order.notes}</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-tg-hint">
        We'll notify you when your order is ready via Telegram 🔔
      </p>

      <button
        onClick={() => router.push('/')}
        className="w-full py-4 rounded-2xl text-white font-bold transition-all active:scale-95"
        style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
      >
        Order More
      </button>
    </main>
  );
}
