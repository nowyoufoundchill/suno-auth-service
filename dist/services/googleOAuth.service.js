"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithGoogle = authenticateWithGoogle;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const uuid_1 = require("uuid");
// Register stealth plugin
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
/**
 * Authenticates with Google OAuth through Suno.com
 * @returns Authentication token
 */
async function authenticateWithGoogle() {
    // This is a placeholder - implement the actual logic when the server works
    try {
        // Return a mock token for now
        return `mock-token-${(0, uuid_1.v4)()}`;
    }
    catch (error) {
        console.error('Google authentication error:', error);
        throw new Error('Failed to authenticate with Google');
    }
}
// The actual implementation using Puppeteer should be uncommented once the server is working
/*
export async function authenticateWithGoogle(): Promise<string> {
  const browser = await puppeteerExtra.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to Suno login
    await page.goto('https://suno.com/login');
    
    // Click the Google login button
    await page.waitForSelector('button[data-provider="google"]');
    await page.click('button[data-provider="google"]');
    
    // Wait for Google login page
    await page.waitForNavigation();
    
    // Fill in Google credentials
    await page.type('input[type="email"]', process.env.GOOGLE_EMAIL || '');
    await page.click('button[type="button"]');
    
    // Wait for password field
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', process.env.GOOGLE_PASSWORD || '');
    await page.click('button[type="button"]');
    
    // Wait for redirect back to Suno
    await page.waitForNavigation();
    
    // Extract the auth token (this will depend on how Suno stores it)
    // This is just an example - you'll need to determine the actual way to extract the token
    const token = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });
    
    if (!token) {
      throw new Error('Could not retrieve authentication token');
    }
    
    return token;
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
*/ 
//# sourceMappingURL=googleOAuth.service.js.map