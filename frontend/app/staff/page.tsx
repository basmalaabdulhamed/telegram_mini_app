'use client';

import { useEffect, useState, useCallback } from 'react';

interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  total: number;
  firstName: string | null;
  telegramUsername: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_FLOW: Record<string, string> = {
  pending: 'preparing',
  paid: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: '⏳ New',       color: '#f59e0b', bg: '#fef3c7' },
  paid:      { label: '✅ Paid',      color: '#10b981', bg: '#d1fae5' },
  preparing: { label: '👨‍🍳 Preparing', color: '#3b82f6', bg: '#dbeafe' },
  ready:     { label: '🎉 Ready',     color: '#8b5cf6', bg: '#ede9fe' },
};

const STATUS_ORDER = ['pending', 'paid', 'preparing', 'ready'];

export default function StaffPage() {
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [advancing, setAdvancing] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://telegramminiapp-production-f419.up.railway.app';

  const fetchOrders = useCallback(async (staffPin: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/staff/orders`, {
        headers: { 'x-staff-pin': staffPin },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      setError('Failed to load orders');
    }
  }, [apiUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`${apiUrl}/api/staff/orders`, {
      headers: { 'x-staff-pin': pin },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setAuthed(true);
    } else {
      setError('Wrong PIN. Try again.');
    }
    setLoading(false);
  };

  // Poll every 8 seconds
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => fetchOrders(pin), 8000);
    return () => clearInterval(interval);
  }, [authed, pin, fetchOrders]);

  const advanceStatus = async (orderId: string, nextStatus: string) => {
    setAdvancing(orderId);
    await fetch(`${apiUrl}/api/staff/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-staff-pin': pin },
      body: JSON.stringify({ status: nextStatus }),
    });
    await fetchOrders(pin);
    setAdvancing(null);
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    setAdvancing(orderId);
    await fetch(`${apiUrl}/api/staff/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-staff-pin': pin },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    await fetchOrders(pin);
    setAdvancing(null);
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">👨‍🍳</div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your PIN to access the order queue</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full py-3 rounded-2xl bg-blue-500 text-white font-bold disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const grouped = STATUS_ORDER.reduce<Record<string, Order[]>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Order Queue</h1>
          <p className="text-xs text-gray-400">
            {orders.length} active • refreshes every 8s
          </p>
        </div>
        <button
          onClick={() => fetchOrders(pin)}
          className="text-blue-500 text-sm font-semibold"
        >
          ↻ Refresh
        </button>
      </header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => {
          const { label, color, bg } = STATUS_LABELS[status];
          const colOrders = grouped[status];
          return (
            <div key={status} className="flex flex-col gap-3">
              <div
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold"
                style={{ color, background: bg }}
              >
                <span>{label}</span>
                <span className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: color, color: '#fff' }}
                >
                  {colOrders.length}
                </span>
              </div>

              {colOrders.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">No orders</p>
              )}

              {colOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.firstName || order.telegramUsername || 'Customer'} •{' '}
                        {order.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {order.total.toFixed(0)} EGP
                    </span>
                  </div>

                  <ul className="text-xs text-gray-600 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id}>• {item.name} × {item.quantity}</li>
                    ))}
                  </ul>

                  {order.notes && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                      📝 {order.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {STATUS_FLOW[order.status] && (
                      <button
                        onClick={() => advanceStatus(order.id, STATUS_FLOW[order.status])}
                        disabled={advancing === order.id}
                        className="flex-1 py-2 rounded-xl text-white text-xs font-bold bg-blue-500 disabled:opacity-50"
                      >
                        {advancing === order.id ? '…' : `→ ${STATUS_LABELS[STATUS_FLOW[order.status]]?.label ?? 'Next'}`}
                      </button>
                    )}
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={advancing === order.id}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-red-50 text-red-500 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
