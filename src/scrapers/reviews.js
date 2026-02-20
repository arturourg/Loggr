import * as cheerio from 'cheerio';
import { fetchPage } from '../utils/scraper.js';
import Cache from '../utils/cache.js';
import { config } from '../config.js';

const cache = new Cache(config.scraping.cacheTtlMinutes);

function parseReview($, el, username) {
  const $el = $(el);
  
  const review = {
    gameName: $el.find('.game-text-centered').text().trim() || 
               $el.find('img').attr('alt') || '',
    gameCover: $el.find('img.card-img').attr('src') || $el.find('img').attr('src'),
    gameUrl: $el.find('.cover-link').attr('href') || $el.find('a').first().attr('href') || '',
    rating: null,
    content: $el.find('.review-text, .card-text').text().trim(),
    date: $el.find('.review-date, time').text().trim(),
    url: '',
    author: username,
    excerpt: '',
  };

  const stars = $el.find('.stars i.fa-star, .rating-stars i').length;
  if (stars > 0) {
    review.rating = stars;
  }

  if (review.gameUrl && !review.gameUrl.startsWith('http')) {
    review.gameUrl = `https://www.backloggd.com${review.gameUrl}`;
  }

  review.excerpt = review.content.length > 300 
    ? review.content.substring(0, 300) + '...'
    : review.content || 'No review text available.';

  return review;
}

export async function getReviews(username, limit = 3) {
  const cacheKey = `reviews:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  try {
    const response = await fetchPage(`/u/${username}/reviews/`);
    const $ = cheerio.load(response.data);
    
    const reviews = [];
    
    $('.user-review, .review-card, .game-cover').each((_, el) => {
      if (reviews.length >= limit) return false;
      const review = parseReview($, el, username);
      if (review.gameName) reviews.push(review);
    });

    cache.set(cacheKey, reviews);
    return reviews.slice(0, limit);

  } catch (error) {
    console.error('getReviews error:', error.message);
    return [];
  }
}

export async function getLastReview(username) {
  const reviews = await getReviews(username, 1);
  return reviews[0] || null;
}

export default { getReviews, getLastReview };
