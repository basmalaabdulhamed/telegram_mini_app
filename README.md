# Telegram Café Ordering System

A full-stack Telegram Mini App ordering system for cafes and restaurants — built with grammY, Next.js, Express, Prisma, and Paymob.

---

## Project Structure

```
telegram_mini_app/
├── backend/     # Node.js + Express API + grammY Telegram bot
└── frontend/    # Next.js 14 Mini App (opens inside Telegram)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

---

### 1. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npx prisma generate
npx prisma db push     # Create tables
npm run db:seed        # Seed sample menu
npm run dev            # Starts on http://localhost:3001
```

### 2. Set up the Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in your values
npm run dev                  # Starts on http://localhost:3000
```

---

## BotFather Setup

### Step 1 — Create a bot
1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the bot token into `backend/.env` → `BOT_TOKEN`

### Step 2 — Set up the Mini App
There are two ways to attach the Mini App:

**Option A — Menu Button (recommended)**
1. Send `/setmenubutton` to BotFather
2. Select your bot
3. Enter your Mini App URL (e.g. `https://your-app.vercel.app`)
4. Enter a button label (e.g. `🍽️ Order Now`)

**Option B — Inline button via `/start`**  
Already implemented! The bot sends an inline button when users send `/start`. Just make sure `WEBAPP_URL` in `backend/.env` points to your deployed frontend URL.

### Step 3 — Enable Inline Mode (optional, for later phases)
1. Send `/setinline` to BotFather
2. Select your bot
3. Set a placeholder like `Search menu items…`

---

## Environment Variables

### backend/.env
| Variable | Description |
|---|---|
| `BOT_TOKEN` | Telegram bot token from BotFather |
| `PORT` | API server port (default: 3001) |
| `DATABASE_URL` | PostgreSQL connection string |
| `WEBAPP_URL` | Your deployed frontend URL |
| `ADMIN_PASSWORD` | Password for `/admin` panel (Phase 7) |
| `STAFF_PIN` | PIN for `/staff` queue (Phase 6) |
| `PAYMOB_API_KEY` | Paymob sandbox API key (Phase 5) |
| `PAYMOB_INTEGRATION_ID` | Paymob integration ID (Phase 5) |
| `PAYMOB_IFRAME_ID` | Paymob iframe ID (Phase 5) |
| `PAYMOB_HMAC_SECRET` | Paymob webhook HMAC secret (Phase 5) |

### frontend/.env.local
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## Build Phases

| Phase | Feature | Status |
|---|---|---|
| 1 | Skeleton — bot + Mini App loads | ✅ Complete |
| 2 | Menu — browsable menu from DB | 🔜 Next |
| 3 | Cart + Order — submit orders | ⏳ Planned |
| 4 | Telegram Auth — HMAC verification | ⏳ Planned |
| 5 | Payment — Paymob + cash pickup | ⏳ Planned |
| 6 | Staff Queue — live order pipeline | ⏳ Planned |
| 7 | Admin Panel — menu management | ⏳ Planned |
| 8 | Polish — i18n, loyalty, analytics | ⏳ Planned |

---

## Testing the Bot Locally

For local development, use [ngrok](https://ngrok.com/) to expose your frontend:

```bash
# Install ngrok, then:
ngrok http 3000
# Copy the https URL → set as WEBAPP_URL in backend/.env
```

The bot uses long-polling by default (no webhook needed for local dev).
