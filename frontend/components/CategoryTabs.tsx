'use client';

import { useEffect, useRef } from 'react';

interface Tab {
  label: string;
  id: string;
}

interface CategoryTabsProps {
  categories: Tab[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'text-white shadow-md scale-105'
                : 'text-tg-hint hover:text-tg-text'
            }`}
            style={
              isActive
                ? { background: 'var(--tg-theme-button-color, #3390ec)' }
                : { background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)' }
            }
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
