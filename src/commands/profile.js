import { SlashCommandBuilder } from 'discord.js';
import { users } from '../database/db.js';
import { getProfile } from '../scrapers/profile.js';
import { createProfileEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View a Backloggd profile')
  .addStringOption(option =>
    option.setName('username')
      .setDescription('Backloggd username or leave empty for your linked account')
      .setRequired(false))
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user to view their linked profile')
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
        embeds: [createErrorEmbed('Use `/connect` first to link your Backloggd account, or specify a username.')]
      });
    }
  }

  try {
    const profile = await getProfile(username);

    if (profile.error || !profile.username) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`User "${username}" not found on Backloggd.`)]
      });
    }

    const embed = createProfileEmbed(profile);

    if (profile.recentGames.length > 0) {
      const recentGamesText = profile.recentGames
        .map(g => `[${g.name}](${g.url})`)
        .join('\n');
      embed.addFields({ name: '🎮 Recent Games', value: recentGamesText });
    }

    return interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Profile error:', error);
    return interaction.editReply({
      embeds: [createErrorEmbed('An error occurred while fetching the profile.')]
    });
  }
}
