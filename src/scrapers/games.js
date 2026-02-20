import * as cheerio from 'cheerio';
import { fetchPage } from '../utils/scraper.js';
import Cache from '../utils/cache.js';
import { config } from '../config.js';

const cache = new Cache(config.scraping.cacheTtlMinutes);

function parseGameCard($, el) {
  const $el = $(el);
  
  const game = {
    name: $el.find('.game-text-centered').text().trim() || 
           $el.find('img').attr('alt') || '',
    cover: $el.find('img.card-img').attr('src') || $el.find('img').attr('src'),
    url: $el.find('.cover-link').attr('href') || $el.find('a').attr('href') || '',
    platform: '',
    rating: null,
    date: '',
  };

  const ratingText = $el.find('.rating, .stars').text();
  const ratingMatch = ratingText.match(/(\d)/);
  if (ratingMatch) {
    game.rating = parseInt(ratingMatch[1]);
  }

  if (game.url && !game.url.startsWith('http')) {
    game.url = `https://www.backloggd.com${game.url}`;
  }

  return game;
}

export async function getPlaying(username, limit = 10) {
  const cacheKey = `games:playing:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  try {
    const response = await fetchPage(`/u/${username}/games/playing/`);
    const $ = cheerio.load(response.data);
    
    const games = [];
    $('.game-cover').each((_, el) => {
      const game = parseGameCard($, el);
      if (game.name) games.push(game);
    });

    cache.set(cacheKey, games);
    return games.slice(0, limit);

  } catch (error) {
    console.error('getPlaying error:', error.message);
    return [];
  }
}

export async function getPlayed(username, limit = 10) {
  const cacheKey = `games:played:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  try {
    const response = await fetchPage(`/u/${username}/games/played/`);
    const $ = cheerio.load(response.data);
    
    const games = [];
    $('.game-cover').each((_, el) => {
      const game = parseGameCard($, el);
      if (game.name) games.push(game);
    });

    cache.set(cacheKey, games);
    return games.slice(0, limit);

  } catch (error) {
    console.error('getPlayed error:', error.message);
    return [];
  }
}

export async function getWishlist(username, limit = 10) {
  const cacheKey = `games:wishlist:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  try {
    const response = await fetchPage(`/u/${username}/games/wishlist/`);
    const $ = cheerio.load(response.data);
    
    const games = [];
    $('.game-cover').each((_, el) => {
      const game = parseGameCard($, el);
      if (game.name) games.push(game);
    });

    cache.set(cacheKey, games);
    return games.slice(0, limit);

  } catch (error) {
    console.error('getWishlist error:', error.message);
    return [];
  }
}

export default { getPlaying, getPlayed, getWishlist };
