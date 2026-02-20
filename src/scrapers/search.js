import * as cheerio from 'cheerio';
import { fetchPage } from '../utils/scraper.js';

function parseSearchResult($, el) {
  const $el = $(el);
  
  const game = {
    name: $el.find('.game-text-centered').text().trim() || 
           $el.find('img').attr('alt') || '',
    cover: $el.find('img.card-img').attr('src') || $el.find('img').attr('src'),
    url: $el.find('.cover-link').attr('href') || $el.find('a').first().attr('href') || '',
    year: '',
    platforms: [],
  };

  const yearText = $el.find('.release-year, .year').text().trim();
  if (yearText) game.year = yearText;

  $el.find('.platforms span, .platform-tag').each((_, platformEl) => {
    const platform = $(platformEl).text().trim();
    if (platform) game.platforms.push(platform);
  });

  if (game.url && !game.url.startsWith('http')) {
    game.url = `https://www.backloggd.com${game.url}`;
  }

  return game;
}

export async function searchGames(query, limit = 5) {
  try {
    const response = await fetchPage(`/search/?q=${encodeURIComponent(query)}`);
    const $ = cheerio.load(response.data);
    
    const games = [];
    
    $('.game-cover, .search-result, .game-card').each((_, el) => {
      if (games.length >= limit) return false;
      const game = parseSearchResult($, el);
      if (game.name) games.push(game);
    });

    return games;

  } catch (error) {
    console.error('searchGames error:', error.message);
    return [];
  }
}

export default { searchGames };
