'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, addItem, removeItem, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);

    // Get Telegram user data (Phase 4 will harden this with HMAC verification)
    let telegramUserId = 'anonymous';
    let telegramUsername: string | undefined;
    let firstName: string | undefined;

    try {
      const { default: WebApp } = await import('@twa-dev/sdk');
      const user = WebApp.initDataUnsafe?.user;
      if (user) {
        telegramUserId = String(user.id);
        telegramUsername = user.username;
        firstName = user.first_name;
      }
    } catch {}

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${apiUrl}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUserId,
          telegramUsername,
          firstName,
          paymentMethod,
          notes: notes.trim() || undefined,
          items: items.map((i) => ({
            menuItemId: i.item.id,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Order failed');
      }

      const data = await res.json();
      clearCart();
      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 bg-tg-bg">
        <span className="text-5xl">🛒</span>
        <h2 className="text-lg font-bold text-tg-text">Your cart is empty</h2>
        <p className="text-tg-hint text-sm text-center">Add some items from the menu to get started.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-6 py-3 rounded-2xl text-white font-semibold"
          style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
        >
          Browse Menu
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-tg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-tg-bg/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-tg-secondary-bg flex items-center gap-3">
        <button onClick={() => router.back()} className="text-tg-link font-medium text-sm">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-tg-text flex-1">Your Cart</h1>
        <span className="text-xs text-tg-hint">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4 pb-48">
        {/* Cart items */}
        <div className="flex flex-col gap-3">
          {items.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                {item.imageUrl && !imgErrors[item.id] ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    onError={() => setImgErrors((p) => ({ ...p, [item.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-tg-text truncate">{item.name}</p>
                <p className="text-xs text-tg-hint">{item.price} EGP × {quantity}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
                >
                  −
                </button>
                <span className="text-sm font-bold text-tg-text w-4 text-center">{quantity}</span>
                <button
                  onClick={() => addItem(item)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
        >
          <h3 className="font-semibold text-sm text-tg-text mb-3">Payment Method</h3>
          <div className="flex gap-3">
            {(['cash', 'card'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  paymentMethod === method ? 'text-white shadow-sm' : 'text-tg-hint'
                }`}
                style={
                  paymentMethod === method
                    ? { background: 'var(--tg-theme-button-color, #3390ec)' }
                    : { background: 'var(--tg-theme-bg-color, #ffffff)' }
                }
              >
                {method === 'cash' ? '💵 Cash at Pickup' : '💳 Card (Paymob)'}
              </button>
            ))}
          </div>
          {paymentMethod === 'card' && (
            <p className="text-xs text-tg-hint mt-2 text-center">
              Paymob payment coming in Phase 5
            </p>
          )}
        </div>

        {/* Notes */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
        >
          <h3 className="font-semibold text-sm text-tg-text mb-2">Special Instructions</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="No sugar, extra hot, allergy notes…"
            rows={2}
            className="w-full bg-transparent text-sm text-tg-text placeholder-tg-hint resize-none outline-none"
          />
        </div>

        {/* Order summary */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
        >
          <div className="flex justify-between text-sm text-tg-hint mb-1">
            <span>Subtotal</span>
            <span>{totalPrice.toFixed(0)} EGP</span>
          </div>
          <div className="flex justify-between font-bold text-tg-text">
            <span>Total</span>
            <span>{totalPrice.toFixed(0)} EGP</span>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2 bg-tg-bg/95 backdrop-blur-sm">
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-60"
          style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
        >
          {submitting ? 'Placing Order…' : `Place Order • ${totalPrice.toFixed(0)} EGP`}
        </button>
      </div>
    </main>
  );
}
