import { getDb, save } from './init.js';

export const users = {
  connect: (discordUserId, backloggdUsername) => {
    const db = getDb();
    db.run(
      `INSERT INTO users (discord_user_id, backloggd_username)
       VALUES (?, ?)
       ON CONFLICT(discord_user_id) DO UPDATE SET backloggd_username = excluded.backloggd_username`,
      [discordUserId, backloggdUsername]
    );
    save();
  },

  disconnect: (discordUserId) => {
    const db = getDb();
    const result = db.run('DELETE FROM users WHERE discord_user_id = ?', [discordUserId]);
    save();
    return result.changes > 0;
  },

  getBackloggdUsername: (discordUserId) => {
    const db = getDb();
    const rows = db.exec('SELECT backloggd_username FROM users WHERE discord_user_id = ?', [discordUserId]);
    if (rows.length === 0 || rows[0].values.length === 0) return null;
    return rows[0].values[0][0];
  },

  getDiscordUserId: (backloggdUsername) => {
    const db = getDb();
    const rows = db.exec('SELECT discord_user_id FROM users WHERE backloggd_username = ?', [backloggdUsername]);
    if (rows.length === 0 || rows[0].values.length === 0) return null;
    return rows[0].values[0][0];
  },
};

export const guilds = {
  setNotificationChannel: (guildId, channelId) => {
    const db = getDb();
    db.run(
      `INSERT INTO guilds (guild_id, notification_channel_id)
       VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET notification_channel_id = excluded.notification_channel_id`,
      [guildId, channelId]
    );
    save();
  },

  getNotificationChannel: (guildId) => {
    const db = getDb();
    const rows = db.exec('SELECT notification_channel_id FROM guilds WHERE guild_id = ?', [guildId]);
    if (rows.length === 0 || rows[0].values.length === 0) return null;
    return rows[0].values[0][0];
  },
};

export const follows = {
  add: (guildId, followerDiscordId, followedDiscordId) => {
    try {
      const db = getDb();
      db.run(
        `INSERT INTO follows (guild_id, follower_discord_id, followed_discord_id)
         VALUES (?, ?, ?)`,
        [guildId, followerDiscordId, followedDiscordId]
      );
      save();
      return true;
    } catch {
      return false;
    }
  },

  remove: (guildId, followerDiscordId, followedDiscordId) => {
    const db = getDb();
    const result = db.run(
      `DELETE FROM follows
       WHERE guild_id = ? AND follower_discord_id = ? AND followed_discord_id = ?`,
      [guildId, followerDiscordId, followedDiscordId]
    );
    save();
    return result.changes > 0;
  },

  getFollowedUsers: (guildId) => {
    const db = getDb();
    const rows = db.exec(
      `SELECT followed_discord_id FROM follows WHERE guild_id = ?`,
      [guildId]
    );
    if (rows.length === 0) return [];
    return rows[0].values.map(row => row[0]);
  },

  isFollowing: (guildId, followerDiscordId, followedDiscordId) => {
    const db = getDb();
    const rows = db.exec(
      `SELECT 1 FROM follows
       WHERE guild_id = ? AND follower_discord_id = ? AND followed_discord_id = ?`,
      [guildId, followerDiscordId, followedDiscordId]
    );
    return rows.length > 0 && rows[0].values.length > 0;
  },
};

export const activityCache = {
  get: (backloggdUsername) => {
    const db = getDb();
    const rows = db.exec(
      `SELECT last_activity_hash, last_checked_at FROM activity_cache WHERE backloggd_username = ?`,
      [backloggdUsername]
    );
    if (rows.length === 0 || rows[0].values.length === 0) return null;
    return {
      last_activity_hash: rows[0].values[0][0],
      last_checked_at: rows[0].values[0][1],
    };
  },

  set: (backloggdUsername, activityHash) => {
    const db = getDb();
    db.run(
      `INSERT INTO activity_cache (backloggd_username, last_activity_hash, last_checked_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(backloggd_username) DO UPDATE SET
         last_activity_hash = excluded.last_activity_hash,
         last_checked_at = datetime('now')`,
      [backloggdUsername, activityHash]
    );
    save();
  },
};
