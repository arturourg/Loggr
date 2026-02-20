import { SlashCommandBuilder } from 'discord.js';
import { users } from '../database/db.js';
import { getProfile } from '../scrapers/profile.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('connect')
  .setDescription('Link your Backloggd account')
  .addStringOption(option =>
    option.setName('username')
      .setDescription('Your Backloggd username')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();

  const username = interaction.options.getString('username');
  const discordUserId = interaction.user.id;

  try {
    const profile = await getProfile(username);

    if (profile.error || !profile.username) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`User "${username}" not found on Backloggd.`)]
      });
    }

    users.connect(discordUserId, username);

    const embed = createSuccessEmbed('Account Linked', 
      `Your Discord account is now linked to **${username}**!\n\n[View Profile](${profile.url})`)
      .setThumbnail(profile.avatar);

    return interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Connect error:', error);
    return interaction.editReply({
      embeds: [createErrorEmbed('An error occurred while verifying your Backloggd account.')]
    });
  }
}
