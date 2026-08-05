'use client';

import { useCartStore } from '@/store/cartStore';

interface CartBarProps {
  onCheckout: () => void;
}

export default function CartBar({ onCheckout }: CartBarProps) {
  const { totalItems, totalPrice } = useCartStore();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2 z-50">
      <button
        onClick={onCheckout}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-semibold shadow-2xl transition-all duration-200 active:scale-95"
        style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
      >
        <span className="flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {totalItems}
          </span>
          View Cart
        </span>
        <span>{totalPrice.toFixed(0)} EGP</span>
      </button>
    </div>
  );
}
