import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Verifies Telegram WebApp initData using HMAC-SHA256.
 * Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    // Build the data check string (all fields except hash, sorted alphabetically)
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}=${val}`)
      .join('\n');

    // HMAC secret key: HMAC-SHA256("WebAppData", bot_token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Compute expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return expectedHash === hash;
  } catch {
    return false;
  }
}

/**
 * Parse Telegram user from initData string.
 */
export function parseTelegramUser(initData: string): {
  id: string;
  username?: string;
  firstName?: string;
} | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return {
      id: String(user.id),
      username: user.username,
      firstName: user.first_name,
    };
  } catch {
    return null;
  }
}

/**
 * Express middleware: validates x-telegram-init-data header.
 * If valid, attaches tgUser to req. If missing/invalid, falls back gracefully.
 * Set REQUIRE_TG_AUTH=true in env to enforce strict mode.
 */
export function telegramAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const initData = req.headers['x-telegram-init-data'] as string | undefined;
  const botToken = process.env.BOT_TOKEN || '';
  const strictMode = process.env.REQUIRE_TG_AUTH === 'true';

  if (!initData) {
    if (strictMode) {
      return res.status(401).json({ error: 'Telegram auth required' });
    }
    // Permissive mode: allow anonymous (for browser testing)
    (req as any).tgUser = null;
    return next();
  }

  const isValid = verifyTelegramInitData(initData, botToken);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Telegram auth signature' });
  }

  (req as any).tgUser = parseTelegramUser(initData);
  next();
}
