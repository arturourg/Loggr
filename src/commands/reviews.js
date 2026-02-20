import { SlashCommandBuilder } from 'discord.js';
import { users } from '../database/db.js';
import { getReviews } from '../scrapers/reviews.js';
import { createReviewEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('reviews')
  .setDescription('View user reviews')
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
      .setDescription('Number of reviews to show (1-5)')
      .setMinValue(1)
      .setMaxValue(5)
      .setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();

  let username = interaction.options.getString('username');
  const discordUser = interaction.options.getUser('user');
  const limit = interaction.options.getInteger('limit') || 3;

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
    const reviews = await getReviews(username, limit);

    if (reviews.length === 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`No reviews found.`)]
      });
    }

    const embeds = reviews.map(review => createReviewEmbed(review));

    return interaction.editReply({ embeds });

  } catch (error) {
    console.error('Reviews error:', error);
    return interaction.editReply({
      embeds: [createErrorEmbed('An error occurred while fetching reviews.')]
    });
  }
}
