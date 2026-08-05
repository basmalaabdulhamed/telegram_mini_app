import { Bot, InlineKeyboard } from 'grammy';

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is not set');
}

export const bot = new Bot(process.env.BOT_TOKEN);

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-frontend-url.vercel.app';

// /start command — welcome message with Mini App button
bot.command('start', async (ctx) => {
  const firstName = ctx.from?.first_name ?? 'there';

  const keyboard = new InlineKeyboard().webApp(
    '🍽️ Open Menu',
    WEBAPP_URL,
  );

  await ctx.reply(
    `👋 Welcome, ${firstName}!\n\n` +
    `Welcome to our café! Browse our menu and place your order directly in Telegram.\n\n` +
    `Tap the button below to get started 👇`,
    { reply_markup: keyboard },
  );
});

// /help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    '📋 *How to order:*\n\n' +
    '1. Tap *Open Menu* to browse our items\n' +
    '2. Add items to your cart\n' +
    '3. Checkout and choose payment method\n' +
    '4. We\'ll confirm your order!\n\n' +
    'Questions? Message us directly.',
    { parse_mode: 'Markdown' },
  );
});

// Handle unknown commands
bot.on('message', async (ctx) => {
  if (ctx.message.text?.startsWith('/')) {
    await ctx.reply('Unknown command. Try /start to open the menu.');
  }
});

// Error handler
bot.catch((err) => {
  console.error('Bot error:', err);
});
