import * as cheerio from 'cheerio';
import { fetchPage } from '../utils/scraper.js';
import Cache from '../utils/cache.js';
import { config } from '../config.js';

const cache = new Cache(config.scraping.cacheTtlMinutes);

export async function getProfile(username) {
  const cacheKey = `profile:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetchPage(`/u/${username}/`);
    const $ = cheerio.load(response.data);

    const pageTitle = $('title').text();
    if (pageTitle.toLowerCase().includes('404') || pageTitle.toLowerCase().includes('not found')) {
      return { error: 'User not found', exists: false };
    }

    const profile = {
      username,
      url: `https://www.backloggd.com/u/${username}/`,
      avatar: null,
      stats: { played: 0, playing: 0, wishlist: 0, reviews: 0 },
      bio: null,
      recentGames: [],
    };

    profile.avatar = $('.avatar img').attr('src') || 
                      $('#profile-header img').attr('src');

    profile.bio = $('.profile-bio').text().trim() || 
                  $('#profile-about').text().trim();

    const statsText = $('.profile-stats').text();
    const totalGamesMatch = statsText.match(/(\d+)\s*Total Games Played/i);
    const backlogMatch = statsText.match(/(\d+)\s*Games Backloggd/i);
    
    profile.stats = {
      played: totalGamesMatch ? parseInt(totalGamesMatch[1]) : 0,
      playing: 0,
      wishlist: 0,
      reviews: backlogMatch ? parseInt(backlogMatch[1]) : 0,
    };

    cache.set(cacheKey, profile);
    return profile;

  } catch (error) {
    console.error('Profile fetch error:', error.message);
    return { error: error.message, exists: false };
  }
}

export async function userExists(username) {
  const profile = await getProfile(username);
  return !profile.error;
}

export function clearCache(username) {
  cache.delete(`profile:${username}`);
  cache.delete(`games:playing:${username}`);
  cache.delete(`games:played:${username}`);
  cache.delete(`games:wishlist:${username}`);
  cache.delete(`reviews:${username}`);
}

export default { getProfile, userExists, clearCache };
