import 'dotenv/config';

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
  },
  database: {
    path: process.env.DATABASE_PATH || './data/backloggdbot.db',
  },
  scraping: {
    delayMs: parseInt(process.env.SCRAPE_DELAY_MS) || 3000,
    cacheTtlMinutes: parseInt(process.env.CACHE_TTL_MINUTES) || 10,
    baseUrl: 'https://www.backloggd.com',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  polling: {
    intervalMinutes: parseInt(process.env.POLL_INTERVAL_MINUTES) || 30,
  },
  embed: {
    color: 0xE8562A,
  },
};
