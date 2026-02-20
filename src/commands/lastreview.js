import { SlashCommandBuilder } from 'discord.js';
import { users } from '../database/db.js';
import { getLastReview } from '../scrapers/reviews.js';
import { createReviewEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('lastreview')
  .setDescription('View the most recent review')
  .addStringOption(option =>
    option.setName('username')
      .setDescription('Backloggd username')
      .setRequired(false))
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user')
      .setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();

  let username = interaction.options.getString('username');
  const discordUser = interaction.options.getUser('user');

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
    const review = await getLastReview(username);

    if (!review) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`No reviews found for ${username}.`)]
      });
    }

    const embed = createReviewEmbed(review);
    return interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('LastReview error:', error);
    return interaction.editReply({
      embeds: [createErrorEmbed('An error occurred while fetching the review.')]
    });
  }
}
