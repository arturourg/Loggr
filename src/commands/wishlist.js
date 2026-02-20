import { SlashCommandBuilder } from 'discord.js';
import { users } from '../database/db.js';
import { getWishlist } from '../scrapers/games.js';
import { createGamesListEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('wishlist')
  .setDescription('View a user\'s wishlist')
  .addStringOption(option =>
    option.setName('username')
      .setDescription('Backloggd username')
      .setRequired(false))
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user')
      .setRequired(false))
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of games to show (1-10)')
      .setMinValue(1)
      .setMaxValue(10)
      .setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();

  let username = interaction.options.getString('username');
  const discordUser = interaction.options.getUser('user');
  const limit = interaction.options.getInteger('limit') || 5;

  if (!username && discordUser) {
    username = users.getBackloggdUsername(discordUser.id);
    if (!username) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`${discordUser.username} has not linked their Backloggd account.`)]
      });
    }
  }

  if (!username) {
    username = users.getBackloggdUsername(interaction.user.id);
    if (!username) {
      return interaction.editReply({
        embeds: [createErrorEmbed('Use `/connect` first or specify a username.')]
      });
    }
  }

  try {
    const games = await getWishlist(username, limit);

    if (games.length === 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Wishlist is empty.`)]
      });
    }

    const embed = createGamesListEmbed(games, `📋 Wishlist - ${username}`, username);
    return interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Wishlist error:', error);
    return interaction.editReply({
      embeds: [createErrorEmbed('An error occurred while fetching wishlist.')]
    });
  }
}
