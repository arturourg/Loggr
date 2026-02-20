import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createBaseEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show all available commands');

export async function execute(interaction) {
  const embed = createBaseEmbed({
    title: 'BackloggdBot Commands',
    description: 'Connect your Backloggd account and share your gaming activity on Discord!',
  })
    .addFields(
      { name: '🔗 Account', value: 
        '`/connect [username]` - Link your Backloggd account\n' +
        '`/disconnect` - Unlink your account', inline: false },
      { name: '👤 Profile', value: 
        '`/profile [user?]` - View a Backloggd profile', inline: false },
      { name: '🎮 Games', value: 
        '`/playing [user?]` - Games currently playing\n' +
        '`/played [user?]` - Played/completed games\n' +
        '`/wishlist [user?]` - View wishlist', inline: false },
      { name: '📝 Reviews', value: 
        '`/reviews [user?]` - View user reviews\n' +
        '`/lastreview [user?]` - Most recent review', inline: false },
      { name: '🔍 Search', value: 
        '`/game [name]` - Search for a game', inline: false },
      { name: '🔔 Activity (Admin)', value: 
        '`/setchannel #channel` - Set notification channel\n' +
        '`/follow @user` - Follow user activity\n' +
        '`/unfollow @user` - Stop following', inline: false },
    )
    .addFields({
      name: 'Links',
      value: '[Backloggd](https://www.backloggd.com) • [Bot Repository](https://github.com)',
    });

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
