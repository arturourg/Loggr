import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { guilds } from '../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('setchannel')
  .setDescription('Set the notification channel for activity updates (Admin only)')
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel for notifications')
      .setRequired(true));

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return interaction.reply({
      embeds: [createErrorEmbed('You need "Manage Server" permission to use this command.')],
      ephemeral: true
    });
  }

  const channel = interaction.options.getChannel('channel');

  if (!channel.isTextBased()) {
    return interaction.reply({
      embeds: [createErrorEmbed('Please select a text channel.')],
      ephemeral: true
    });
  }

  guilds.setNotificationChannel(interaction.guildId, channel.id);

  const embed = createSuccessEmbed('Channel Set',
    `Activity notifications will be sent to ${channel}.`);

  return interaction.reply({ embeds: [embed] });
}
