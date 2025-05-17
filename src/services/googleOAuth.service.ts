import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Register stealth plugin
puppeteerExtra.use(StealthPlugin());

/**
 * Authenticates with Google OAuth through Suno.com
 * @returns Authentication token
 */
export async function authenticateWithGoogle(): Promise<string> {
  const browser = await puppeteerExtra.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,720'
    ]
  });

  try {
    console.log('Browser launched, opening new page...');
    const page = await browser.newPage();
    
    // Set viewport to match a typical desktop
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to Suno homepage
    console.log('Navigating to Suno.com...');
    await page.goto('https://suno.com', { waitUntil: 'networkidle2' });
    
    // Click the Sign In button to trigger the login popup
    console.log('Clicking Sign In button...');
    await page.waitForSelector('button:has-text("Sign In")');
    await page.click('button:has-text("Sign In")');
    
    // Wait for the login popup to appear
    console.log('Waiting for login popup...');
    await page.waitForSelector('.auth-dialog', { visible: true, timeout: 10000 });
    
    // Click the Google login button
    console.log('Clicking Google login button...');
    await page.waitForSelector('button[aria-label="Google"]', { visible: true });
    await page.click('button[aria-label="Google"]');
    
    // Wait for Google login page or account selection screen
    console.log('Waiting for Google login page or account selection...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Check if we're on the account selection screen
    const isAccountSelectionPage = await page.evaluate(() => {
      return document.querySelector('div[aria-labelledby="headingText"]')?.textContent?.includes('Choose an account') || false;
    });
    
    if (isAccountSelectionPage) {
      console.log('On account selection page, selecting the correct account...');
      
      // Try to find the account with the correct email
      const targetEmail = process.env.GOOGLE_EMAIL;
      const accountFound = await page.evaluate((email) => {
        const accountDivs = Array.from(document.querySelectorAll('div[data-email]'));
        const targetDiv = accountDivs.find(div => div.getAttribute('data-email') === email);
        if (targetDiv) {
          targetDiv.click();
          return true;
        }
        return false;
      }, targetEmail);
      
      if (!accountFound) {
        // If account not found directly, try to click "Use another account"
        console.log('Account not found directly, trying "Use another account"...');
        await page.waitForSelector('div:has-text("Use another account")');
        await page.click('div:has-text("Use another account")');
        
        // Now enter email
        console.log('Entering Google email...');
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', process.env.GOOGLE_EMAIL || '');
        await page.keyboard.press('Enter');
        
        // Wait for password field
        console.log('Waiting for password field...');
        await page.waitForSelector('input[type="password"]', { visible: true, timeout: 10000 });
        await page.type('input[type="password"]', process.env.GOOGLE_PASSWORD || '');
        await page.keyboard.press('Enter');
      }
    } else {
      // Regular login flow with email and password
      console.log('On standard login page, entering credentials...');
      // Enter Google email
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', process.env.GOOGLE_EMAIL || '');
      await page.keyboard.press('Enter');
      
      // Wait for password field
      console.log('Waiting for password field...');
      await page.waitForSelector('input[type="password"]', { visible: true, timeout: 10000 });
      await page.type('input[type="password"]', process.env.GOOGLE_PASSWORD || '');
      await page.keyboard.press('Enter');
    }
    
    // Wait for redirect back to Suno
    console.log('Waiting for redirect back to Suno...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
    
    // Extract authentication token from localStorage
    console.log('Extracting authentication token...');
    const token = await page.evaluate(() => {
      // Look for auth token in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('token') || key.includes('auth'))) {
          return localStorage.getItem(key);
        }
      }
      // If not found in localStorage, try to find it in cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        if (cookie.includes('token') || cookie.includes('auth')) {
          return cookie.split('=')[1];
        }
      }
      return null;
    });
    
    if (!token) {
      console.error('Could not retrieve authentication token');
      throw new Error('Could not retrieve authentication token');
    }
    
    console.log('Authentication successful');
    return token;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}