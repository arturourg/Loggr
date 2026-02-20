import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { users } from '../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('disconnect')
  .setDescription('Unlink your Backloggd account');

export async function execute(interaction) {
  const discordUserId = interaction.user.id;
  const currentUsername = users.getBackloggdUsername(discordUserId);

  if (!currentUsername) {
    return interaction.reply({
      embeds: [createErrorEmbed('Your account is not linked. Use `/connect` to link your Backloggd account.')],
      flags: MessageFlags.Ephemeral
    });
  }

  users.disconnect(discordUserId);

  const embed = createSuccessEmbed('Account Unlinked', 
    `Your Backloggd account (**${currentUsername}**) has been unlinked.`);

  return interaction.reply({ embeds: [embed] });
}
