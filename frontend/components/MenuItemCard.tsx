'use client';

import Image from 'next/image';
import { useState } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  available: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}

export default function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex gap-3 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
      style={{ background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }}
    >
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
        {item.imageUrl && !imgError ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-tg-text text-sm leading-tight truncate">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-tg-hint mt-0.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-sm" style={{ color: 'var(--tg-theme-button-color, #3390ec)' }}>
            {item.price} EGP
          </span>

          {/* Quantity controls */}
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold transition-all duration-150 active:scale-90 shadow-sm"
              style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
            >
              <span className="text-base leading-none">+</span>
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(item.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-base transition-all duration-150 active:scale-90"
                style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
              >
                −
              </button>
              <span className="text-sm font-bold text-tg-text w-4 text-center">{quantity}</span>
              <button
                onClick={() => onAdd(item)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-base transition-all duration-150 active:scale-90"
                style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
