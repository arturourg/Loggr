import puppeteer from 'puppeteer';
import { config } from '../config.js';

let browser = null;
let page = null;
let isInitialized = false;
const requestQueue = [];
let isProcessing = false;

async function initBrowser() {
  if (isInitialized) return;
  
  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await page.setUserAgent(config.scraping.userAgent);
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(config.scraping.baseUrl, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  
  await new Promise(r => setTimeout(r, 1500));
  isInitialized = true;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    isInitialized = false;
  }
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (requestQueue.length > 0) {
    const { resolve, reject, path } = requestQueue.shift();

    try {
      await initBrowser();

      const url = `${config.scraping.baseUrl}${path}`;
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await new Promise(r => setTimeout(r, 1000));

      const html = await page.content();

      if (html.includes('403 Forbidden')) {
        reject(new Error('Access forbidden'));
      } else {
        resolve({ data: html });
      }
    } catch (error) {
      reject(error);
    }

    if (requestQueue.length > 0) {
      await new Promise(r => setTimeout(r, config.scraping.delayMs));
    }
  }

  isProcessing = false;
}

export async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, path });
    processQueue();
  });
}

export function createHash(data) {
  return JSON.stringify(data);
}

export default { fetchPage, closeBrowser, createHash };
