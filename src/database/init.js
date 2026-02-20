import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config.js';

const dbPath = config.database.path;

mkdirSync(dirname(dbPath), { recursive: true });

let db = null;

export async function initDatabase() {
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      discord_user_id TEXT PRIMARY KEY,
      backloggd_username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS guilds (
      guild_id TEXT PRIMARY KEY,
      notification_channel_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS follows (
      guild_id TEXT,
      follower_discord_id TEXT,
      followed_discord_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (guild_id, follower_discord_id, followed_discord_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_cache (
      backloggd_username TEXT PRIMARY KEY,
      last_activity_hash TEXT,
      last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  save();
  return db;
}

export function save() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export function getDb() {
  return db;
}

export default { initDatabase, save, getDb };
