import { getPlaying, getPlayed } from '../scrapers/games.js';
import { getReviews } from '../scrapers/reviews.js';
import { users, follows, guilds, activityCache } from '../database/db.js';
import { createActivityEmbed } from '../utils/embeds.js';
import { createHash } from '../utils/scraper.js';

async function getUserActivity(username) {
  const [playing, played, reviews] = await Promise.all([
    getPlaying(username, 5),
    getPlayed(username, 5),
    getReviews(username, 3),
  ]);

  return { playing, played, reviews };
}

function calculateActivityHash(activity) {
  const data = {
    playing: activity.playing.map(g => g.name).sort(),
    played: activity.played.slice(0, 3).map(g => g.name).sort(),
    reviews: activity.reviews.slice(0, 2).map(r => r.gameName).sort(),
  };
  return createHash(data);
}

export async function checkForNewActivity(client) {
  console.log('Checking for activity updates...');

  const guildList = client.guilds.cache;

  for (const [guildId, guild] of guildList) {
    const channelId = guilds.getNotificationChannel(guildId);
    if (!channelId) continue;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;

    const followedUserIds = follows.getFollowedUsers(guildId);

    for (const followedId of followedUserIds) {
      const username = users.getBackloggdUsername(followedId);
      if (!username) continue;

      try {
        const activity = await getUserActivity(username);
        const newHash = calculateActivityHash(activity);
        const cached = activityCache.get(username);

        if (cached && cached.last_activity_hash !== newHash) {
          const notifications = await detectChanges(username, cached.last_activity_hash, activity);
          
          for (const notification of notifications) {
            const embed = createActivityEmbed({
              type: notification.type,
              username,
              gameName: notification.gameName,
              gameUrl: notification.gameUrl,
              gameCover: notification.gameCover,
              description: notification.description,
            });
            
            try {
              await channel.send({ embeds: [embed] });
            } catch (sendError) {
              console.error(`Failed to send notification to channel ${channelId}:`, sendError.message);
            }
          }
        }

        activityCache.set(username, newHash);

      } catch (error) {
        console.error(`Error checking activity for ${username}:`, error.message);
      }
    }
  }
}

async function detectChanges(username, oldHash, newActivity) {
  const notifications = [];

  if (newActivity.playing.length > 0) {
    notifications.push({
      type: 'started',
      gameName: newActivity.playing[0].name,
      gameUrl: newActivity.playing[0].url,
      gameCover: newActivity.playing[0].cover,
      description: `Now playing ${newActivity.playing[0].name}`,
    });
  }

  if (newActivity.reviews.length > 0) {
    notifications.push({
      type: 'review',
      gameName: newActivity.reviews[0].gameName,
      gameUrl: newActivity.reviews[0].gameUrl,
      gameCover: newActivity.reviews[0].gameCover,
      description: newActivity.reviews[0].excerpt,
    });
  }

  return notifications.slice(0, 2);
}

export default { checkForNewActivity };
