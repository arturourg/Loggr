import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { users, follows } from '../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('follow')
  .setDescription('Follow a user to receive their activity updates')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user to follow')
      .setRequired(true));

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user');
  const followerId = interaction.user.id;

  if (targetUser.id === followerId) {
    return interaction.reply({
      embeds: [createErrorEmbed('You cannot follow yourself.')],
      flags: MessageFlags.Ephemeral
    });
  }

  const targetUsername = users.getBackloggdUsername(targetUser.id);
  if (!targetUsername) {
    return interaction.reply({
      embeds: [createErrorEmbed(`${targetUser.username} has not linked their Backloggd account.`)],
      flags: MessageFlags.Ephemeral
    });
  }

  const alreadyFollowing = follows.isFollowing(interaction.guildId, followerId, targetUser.id);
  if (alreadyFollowing) {
    return interaction.reply({
      embeds: [createErrorEmbed(`You are already following ${targetUser.username}.`)],
      flags: MessageFlags.Ephemeral
    });
  }

  follows.add(interaction.guildId, followerId, targetUser.id);

  const embed = createSuccessEmbed('Following User',
    `You are now following **${targetUser.username}** (${targetUsername}).\nYou will receive notifications when they update their gaming activity.`);

  return interaction.reply({ embeds: [embed] });
}
