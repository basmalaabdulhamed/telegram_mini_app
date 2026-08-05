import 'dotenv/config';
import { bot } from './bot';
import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

async function main() {
  // Start Express API server
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
  });

  // Start Telegram bot (long-polling)
  bot.start({
    onStart: (info) => {
      console.log(`✅ Bot @${info.username} is running`);
    },
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
