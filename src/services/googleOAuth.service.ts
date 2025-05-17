import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Constants
const SUNO_URL = 'https://suno.com';
const AUTH_TIMEOUT = 60000; // 1 minute
const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export interface AuthResult {
  success: boolean;
  sessionData?: string;
  cookies?: any[];
  error?: string;
}

export class GoogleOAuthService {
  private browser: Browser | null = null;
  
  /**
   * Authenticate with Google OAuth for Suno
   * @param email Google email
   * @param password Google password
   * @returns Session data that can be used for future requests
   */
  async authenticate(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      return { 
        success: false, 
        error: 'Google credentials are required' 
      };
    }
    
    try {
      // Initialize browser
      this.browser = await this.initBrowser();
      const page = await this.browser.newPage();
      
      // Set up stealth measures
      await this.setupStealthMode(page);
      
      // Log in to Suno with Google
      logger.info('Starting Google OAuth authentication for Suno...');
      const authResult = await this.performGoogleAuth(page, email, password);
      
      if (!authResult.success) {
        return { 
          success: false, 
          error: authResult.error || 'Authentication failed' 
        };
      }
      
      // Extract session data
      logger.info('Authentication successful, extracting session data...');
      const cookies = await page.cookies();
      
      // Save cookies to a file for debugging
      const cookiePath = path.join(TEMP_DIR, `suno-cookies-${Date.now()}.json`);
      fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
      
      // Create session string from cookies
      const sessionCookies = cookies
        .filter(cookie => ['sessionid', 'csrftoken', 'suno_session'].some(name => cookie.name.includes(name)))
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
      
      return {
        success: true,
        sessionData: sessionCookies,
        cookies
      };
    } catch (error: any) {
      logger.error('Error during Google OAuth authentication:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.closeBrowser();
    }
  }
  
  /**
   * Initialize browser with stealth configuration
   */
  private async initBrowser(): Promise<Browser> {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-extensions',
      '--disable-gpu',
      '--window-size=1280,800'
    ];
    
    return puppeteer.launch({
      headless: true,
      args,
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
  }
  
  /**
   * Set up page with stealth measures to avoid detection
   */
  private async setupStealthMode(page: Page): Promise<void> {
    // Set realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );
    
    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'sec-ch-ua': '"Google Chrome";v="125", " Not;A Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Add browser fingerprint evasion
    await page.evaluateOnNewDocument(() => {
      // Override navigator properties
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Add language plugins
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Add mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          return [
            {
              0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: true,
              },
              name: 'Chrome PDF Plugin',
              description: 'Portable Document Format',
              filename: 'internal-pdf-viewer',
              length: 1,
            }
          ];
        },
      });
    });
  }
  
  /**
   * Perform the Google OAuth authentication flow
   */
  private async performGoogleAuth(page: Page, email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string 
  }> {
    try {
      // Navigate to Suno login page
      await page.goto(`${SUNO_URL}/login`, { waitUntil: 'networkidle2', timeout: AUTH_TIMEOUT });
      logger.info('Loaded Suno login page');
      
      // Take screenshot for debugging
      const loginScreenshot = path.join(TEMP_DIR, `suno-login-${Date.now()}.png`);
      await page.screenshot({ path: loginScreenshot, fullPage: true });
      logger.info(`Login page screenshot saved: ${loginScreenshot}`);
      
      // Look for Google login button
      const googleButton = await page.$('button[data-provider="google"]');
      if (!googleButton) {
        return { success: false, error: 'Google login button not found' };
      }
      
      // Click Google login button
      await googleButton.click();
      logger.info('Clicked Google login button');
      
      // Wait for redirect to Google
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: AUTH_TIMEOUT });
      
      // Take screenshot of Google login page
      const googleScreenshot = path.join(TEMP_DIR, `google-login-${Date.now()}.png`);
      await page.screenshot({ path: googleScreenshot, fullPage: true });
      logger.info(`Google login screenshot saved: ${googleScreenshot}`);
      
      // Enter email
      const emailInput = await page.$('input[type="email"]');
      if (!emailInput) {
        return { success: false, error: 'Email input not found' };
      }
      
      await emailInput.type(email, { delay: 100 });
      await page.keyboard.press('Enter');
      logger.info('Entered email address');
      
      // Wait for password input
      await page.waitForSelector('input[type="password"]', { timeout: AUTH_TIMEOUT });
      
      // Enter password
      await page.type('input[type="password"]', password, { delay: 100 });
      await page.keyboard.press('Enter');
      logger.info('Entered password');
      
      // Wait for redirect back to Suno
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: AUTH_TIMEOUT });
      
      // Take screenshot after login
      const postLoginScreenshot = path.join(TEMP_DIR, `post-login-${Date.now()}.png`);
      await page.screenshot({ path: postLoginScreenshot, fullPage: true });
      logger.info(`Post-login screenshot saved: ${postLoginScreenshot}`);
      
      // Verify login success
      const isLoggedIn = await this.checkLoginStatus(page);
      
      if (!isLoggedIn) {
        return { success: false, error: 'Login verification failed' };
      }
      
      return { success: true };
    } catch (error: any) {
      logger.error('Error in Google auth flow:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Check if login was successful
   */
  private async checkLoginStatus(page: Page): Promise<boolean> {
    try {
      // Check URL
      const url = page.url();
      if (!url.includes('suno.com')) {
        return false;
      }
      
      // Look for elements that indicate successful login
      const loginIndicators = [
        'div[data-testid="user-menu"]',
        'button[aria-label="Account settings"]',
        'a[href="/account"]',
        'button:has-text("New Song")',
        'div[class*="avatar"]'
      ];
      
      for (const selector of loginIndicators) {
        const element = await page.$(selector);
        if (element) {
          logger.info(`Found login indicator: ${selector}`);
          return true;
        }
      }
      
      // Check for logged in cookies
      const cookies = await page.cookies();
      const hasSessionCookies = cookies.some(cookie => 
        cookie.name.includes('sessionid') || 
        cookie.name.includes('suno_session')
      );
      
      return hasSessionCookies;
    } catch (error) {
      logger.error('Error checking login status:', error);
      return false;
    }
  }
  
  /**
   * Close browser instance
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Verify if session data is still valid
   */
  async verifySession(sessionData: string): Promise<boolean> {
    if (!sessionData) {
      return false;
    }
    
    try {
      this.browser = await this.initBrowser();
      const page = await this.browser.newPage();
      
      // Set the session cookies
      const cookieStrings = sessionData.split(';');
      for (const cookieStr of cookieStrings) {
        const [name, value] = cookieStr.trim().split('=');
        if (name && value) {
          await page.setCookie({
            name,
            value,
            domain: 'suno.com',
            path: '/'
          });
        }
      }
      
      // Navigate to Suno
      await page.goto(SUNO_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if we're logged in
      const isLoggedIn = await this.checkLoginStatus(page);
      
      return isLoggedIn;
    } catch (error) {
      logger.error('Error verifying session:', error);
      return false;
    } finally {
      await this.closeBrowser();
    }
  }
}

export const googleOAuthService = new GoogleOAuthService();