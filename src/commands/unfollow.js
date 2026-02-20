import { SlashCommandBuilder } from 'discord.js';
import { follows } from '../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('unfollow')
  .setDescription('Stop following a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user to unfollow')
      .setRequired(true));

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user');
  const followerId = interaction.user.id;

  const wasFollowing = follows.remove(interaction.guildId, followerId, targetUser.id);

  if (!wasFollowing) {
    return interaction.reply({
      embeds: [createErrorEmbed(`You were not following ${targetUser.username}.`)],
      ephemeral: true
    });
  }

  const embed = createSuccessEmbed('Unfollowed User',
    `You are no longer following **${targetUser.username}**.`);

  return interaction.reply({ embeds: [embed] });
}
