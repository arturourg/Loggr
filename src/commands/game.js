import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { searchGames } from '../scrapers/search.js';
import { createBaseEmbed, createErrorEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('game')
  .setDescription('Search for a game on Backloggd')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Game name to search')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of results (1-5)')
      .setMinValue(1)
      .setMaxValue(5)
      .setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();

  const query = interaction.options.getString('name');
  const limit = interaction.options.getInteger('limit') || 5;

  try {
    const games = await searchGames(query, limit);

    if (games.length === 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`No games found for "${query}".`)]
      });
    }

    if (games.length === 1) {
      const game = games[0];
      const embed = createBaseEmbed({
        title: game.name,
        url: game.url,
        thumbnail: game.cover,
      });

      if (game.year) {
        embed.addFields({ name: 'Year', value: game.year, inline: true });
      }
      if (game.platforms.length > 0) {
        embed.addFields({ name: 'Platforms', value: game.platforms.join(', '), inline: true });
      }

      return interaction.editReply({ embeds: [embed] });
    }

    const description = games
      .map((game, index) => {
        let text = `${index + 1}. **[${game.name}](${game.url})**`;
        if (game.year) text += ` (${game.year})`;
        return text;
      })
      .join('\n');

    const embed = createBaseEmbed({
      title: `🔍 Search Results: "${query}"`,
      description,
    });

    const row = new ActionRowBuilder()
      .addComponents(
        games.slice(0, 5).map((game, index) =>
          new ButtonBuilder()
            .setLabel(`${index + 1}`)
            .setStyle(ButtonStyle.Link)
            .setURL(game.url)
        )
      );

    return interaction.editReply({ embeds: [embed], components: [row] });

  } catch (error) {
    console.error('Game search error:', error);
    return interaction.editReply({
      embeds: [createErrorEmbed('An error occurred while searching.')]
    });
  }
}
