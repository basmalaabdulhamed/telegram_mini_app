import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menuItems = [
  // ── Hot Drinks ──────────────────────────────
  {
    name: 'Espresso',
    description: 'Rich, bold single shot of premium arabica espresso',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
    category: 'Hot Drinks',
    sortOrder: 1,
  },
  {
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and thick foam',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    category: 'Hot Drinks',
    sortOrder: 2,
  },
  {
    name: 'Café Latte',
    description: 'Smooth espresso blended with silky steamed milk',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1561882468-9110d70d3bdc?w=400',
    category: 'Hot Drinks',
    sortOrder: 3,
  },
  {
    name: 'Turkish Coffee',
    description: 'Traditional finely ground coffee, medium roast',
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?w=400',
    category: 'Hot Drinks',
    sortOrder: 4,
  },
  {
    name: 'Hot Chocolate',
    description: 'Belgian dark chocolate with steamed whole milk',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400',
    category: 'Hot Drinks',
    sortOrder: 5,
  },

  // ── Cold Drinks ──────────────────────────────
  {
    name: 'Iced Latte',
    description: 'Double espresso over ice with cold milk',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    category: 'Cold Drinks',
    sortOrder: 1,
  },
  {
    name: 'Cold Brew',
    description: '24-hour cold-steeped smooth coffee concentrate',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
    category: 'Cold Drinks',
    sortOrder: 2,
  },
  {
    name: 'Mango Smoothie',
    description: 'Fresh mango blended with yogurt and honey',
    price: 70,
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
    category: 'Cold Drinks',
    sortOrder: 3,
  },
  {
    name: 'Lemonade Mint',
    description: 'Freshly squeezed lemon with mint and sparkling water',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400',
    category: 'Cold Drinks',
    sortOrder: 4,
  },

  // ── Food ─────────────────────────────────────
  {
    name: 'Avocado Toast',
    description: 'Sourdough toast with smashed avocado, cherry tomatoes, feta',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400',
    category: 'Food',
    sortOrder: 1,
  },
  {
    name: 'Club Sandwich',
    description: 'Triple-decker with chicken, turkey, bacon, lettuce, tomato',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
    category: 'Food',
    sortOrder: 2,
  },
  {
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, classic Caesar dressing',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    category: 'Food',
    sortOrder: 3,
  },
  {
    name: 'Grilled Cheese Panini',
    description: 'Three-cheese melt on ciabatta with caramelised onion',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400',
    category: 'Food',
    sortOrder: 4,
  },

  // ── Pastries ─────────────────────────────────
  {
    name: 'Croissant',
    description: 'Freshly baked buttery croissant, plain or almond',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    category: 'Pastries',
    sortOrder: 1,
  },
  {
    name: 'Chocolate Muffin',
    description: 'Double chocolate chip muffin, baked fresh daily',
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
    category: 'Pastries',
    sortOrder: 2,
  },
  {
    name: 'Cheesecake Slice',
    description: 'New York style cheesecake with berry compote',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1582254465498-6bc70419b607?w=400',
    category: 'Pastries',
    sortOrder: 3,
  },
  {
    name: 'Cinnamon Roll',
    description: 'Soft-baked roll with cream cheese icing',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1609428468667-fd12ef3eb06c?w=400',
    category: 'Pastries',
    sortOrder: 4,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing items
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();

  // Insert menu items
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log(`✅ Seeded ${menuItems.length} menu items`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
