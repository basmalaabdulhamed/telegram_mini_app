'use client';

import { useEffect, useState, useRef } from 'react';
import CategoryTabs from '@/components/CategoryTabs';
import MenuItemCard, { MenuItem } from '@/components/MenuItemCard';
import CartBar from '@/components/CartBar';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

interface Category {
  category: string;
  items: MenuItem[];
}

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isScrolling = useRef(false);

  const { addItem, removeItem, getQuantity } = useCartStore();

  // Initialize Telegram WebApp
  useEffect(() => {
    import('@twa-dev/sdk').then((module) => {
      const WebApp = module.default;
      WebApp.ready();
      WebApp.expand();
    });
  }, []);

  // Fetch menu
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://telegramminiapp-production-f419.up.railway.app';
    fetch(`${apiUrl}/api/menu`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch menu');
        return r.json();
      })
      .then((data: { categories: Category[] }) => {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].category);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load the menu. Please try again.');
        setLoading(false);
      });
  }, []);

  // Scroll-spy: update active tab as user scrolls through sections
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling.current) return;
      for (const cat of categories) {
        const el = sectionRefs.current[cat.category];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveCategory(cat.category);
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const handleTabSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    isScrolling.current = true;
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isScrolling.current = false; }, 800);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-tg-bg">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--tg-theme-button-color, #3390ec)', borderTopColor: 'transparent' }}
        />
        <p className="text-tg-hint text-sm">Loading menu…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 bg-tg-bg">
        <span className="text-4xl">😕</span>
        <p className="text-tg-text font-semibold text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-full text-white text-sm font-semibold"
          style={{ background: 'var(--tg-theme-button-color, #3390ec)' }}
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-tg-bg">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-tg-bg/95 backdrop-blur-sm border-b border-tg-secondary-bg">
        <div className="px-4 pt-4 pb-1">
          <h1 className="text-xl font-bold text-tg-text">Our Menu ☕</h1>
          <p className="text-xs text-tg-hint mt-0.5">Order fresh, pick up fast</p>
        </div>
        <CategoryTabs
          categories={categories.map((c) => ({ id: c.category, label: c.category }))}
          activeCategory={activeCategory}
          onSelect={handleTabSelect}
        />
      </header>

      {/* Menu sections */}
      <div className="pb-32">
        {categories.map((cat) => (
          <section
            key={cat.category}
            ref={(el) => { sectionRefs.current[cat.category] = el; }}
            className="pt-4"
          >
            <h2 className="px-4 text-base font-bold text-tg-text mb-3">{cat.category}</h2>
            <div className="px-4 flex flex-col gap-3">
              {cat.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={getQuantity(item.id)}
                  onAdd={addItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating cart bar */}
      <CartBar onCheckout={() => router.push('/cart')} />
    </main>
  );
}
