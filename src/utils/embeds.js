import { EmbedBuilder, time } from 'discord.js';
import { config } from '../config.js';

export function createBaseEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(config.embed.color)
    .setTimestamp()
    .setFooter({ text: options.footer || 'BackloggdBot' });

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.url) embed.setURL(options.url);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.author) embed.setAuthor(options.author);

  return embed;
}

export function createProfileEmbed(profile) {
  return createBaseEmbed({
    title: profile.username,
    url: profile.url,
    thumbnail: profile.avatar,
    footer: `BackloggdBot • ${profile.url}`,
  })
    .addFields(
      { name: '🎮 Played', value: `${profile.stats.played}`, inline: true },
      { name: '🎯 Playing', value: `${profile.stats.playing}`, inline: true },
      { name: '📋 Wishlist', value: `${profile.stats.wishlist}`, inline: true },
      { name: '📝 Reviews', value: `${profile.stats.reviews}`, inline: true },
    );
}

export function createGameEmbed(game, options = {}) {
  const embed = createBaseEmbed({
    title: game.name,
    url: game.url,
    thumbnail: game.cover,
    footer: options.footer || 'BackloggdBot',
  });

  if (game.rating) {
    const stars = '⭐'.repeat(game.rating);
    embed.addFields({ name: 'Rating', value: stars || 'Not rated', inline: true });
  }

  if (game.platform) {
    embed.addFields({ name: 'Platform', value: game.platform, inline: true });
  }

  if (game.date) {
    embed.addFields({ name: 'Date', value: game.date, inline: true });
  }

  return embed;
}

export function createReviewEmbed(review, options = {}) {
  const stars = review.rating ? '⭐'.repeat(review.rating) : 'Not rated';
  
  return createBaseEmbed({
    title: `Review: ${review.gameName}`,
    url: review.url,
    thumbnail: review.gameCover,
    footer: `BackloggdBot • by ${review.author || 'User'}`,
  })
    .setDescription(review.excerpt)
    .addFields(
      { name: 'Rating', value: stars, inline: true },
      { name: 'Date', value: review.date || 'Unknown', inline: true },
    );
}

export function createActivityEmbed(activity) {
  const typeEmojis = {
    started: '🎮',
    completed: '✅',
    review: '📝',
    added: '➕',
  };

  const typeMessages = {
    started: 'started playing',
    completed: 'completed',
    review: 'published a review of',
    added: 'added to their list',
  };

  return createBaseEmbed({
    title: `${typeEmojis[activity.type]} ${activity.username} ${typeMessages[activity.type]} ${activity.gameName}`,
    url: activity.gameUrl,
    thumbnail: activity.gameCover,
    description: activity.description || '',
    footer: 'BackloggdBot Activity',
  });
}

export function createErrorEmbed(message) {
  return createBaseEmbed()
    .setTitle('❌ Error')
    .setDescription(message)
    .setColor(0xFF0000);
}

export function createSuccessEmbed(title, message) {
  return createBaseEmbed()
    .setTitle(`✅ ${title}`)
    .setDescription(message)
    .setColor(0x00FF00);
}

export function createGamesListEmbed(games, title, username) {
  const description = games
    .map((game, index) => {
      const rating = game.rating ? ' ' + '⭐'.repeat(game.rating) : '';
      return `${index + 1}. **[${game.name}](${game.url})**${rating}`;
    })
    .join('\n');

  return createBaseEmbed({
    title,
    description: description || 'No games found',
    footer: `BackloggdBot • backloggd.com/u/${username}`,
  });
}
