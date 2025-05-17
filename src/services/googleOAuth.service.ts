import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs';
import { ElementHandle } from 'puppeteer-core';

// Load environment variables
dotenv.config();

// Register stealth plugin
puppeteerExtra.use(StealthPlugin());

/**
 * Authenticates with Google OAuth through Suno.com
 * @returns Authentication token
 */
export async function authenticateWithGoogle(): Promise<string> {
  console.log('Starting Google authentication process...');
  
  // Determine the correct path to Chrome based on the environment
  let executablePath = '';
  
  // Check common alternative paths
  const possiblePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome'
  ];
  
  for (const path of possiblePaths) {
    try {
      if (fs.existsSync(path)) {
        executablePath = path;
        console.log(`Found browser at: ${path}`);
        break;
      }
    } catch (error) {
      console.log(`Path check error: ${error}`);
    }
  }
  
  console.log(`Using browser at: ${executablePath || 'Not found, will try alternatives'}`);
  
  let browser;
  
  try {
    // Launch the browser
    browser = await puppeteerExtra.launch({
      executablePath: executablePath,
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
    console.log('Successfully launched browser');

    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewport to match a typical desktop
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to Suno homepage
    console.log('Navigating to Suno.com...');
    await page.goto('https://suno.com', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Find and click the Sign In button
    console.log('Looking for Sign In button...');
    const signInSelectors = [
      // Based on the HTML screenshot - most specific first
      'button.relative.inline-block.font-sans.font-medium',
      'button.relative',
      'button[type="button"]',
      // Fallbacks
      '[role="button"]',
      'a'
    ];

    let signInButtonFound = false;
    for (const selector of signInSelectors) {
      try {
        console.log(`Trying Sign In selector: ${selector}`);
        const buttonExists = await page.waitForSelector(selector, { visible: true, timeout: 5000 });
        if (buttonExists) {
          console.log(`Found button with selector: ${selector}`);
          
          // Check if this is actually the Sign In button
          const buttonText = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            return el && el.textContent ? el.textContent.trim() : '';
          }, selector);
          
          if (buttonText.includes('Sign In')) {
            console.log('Confirmed button text contains "Sign In", clicking...');
            await page.click(selector);
            signInButtonFound = true;
            break;
          } else {
            console.log(`Button text doesn't match: "${buttonText}"`);
          }
        }
      } catch (error) {
        console.log(`Selector ${selector} not found`);
      }
    }

    if (!signInButtonFound) {
      // If no selector worked, try by content
      console.log('No selectors worked, trying by content...');
      try {
        // Use evaluate instead of $x
        const signInButtonFound = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('button, [role="button"], a'));
          const signInElement = elements.find(el => el.textContent && el.textContent.includes('Sign In'));
          if (signInElement) {
            (signInElement as HTMLElement).click();
            return true;
          }
          return false;
        });
        
        if (!signInButtonFound) {
          throw new Error('No button with "Sign In" text found');
        }
      } catch (error) {
        console.error('Content search failed:', error);
        throw new Error('Could not find the Sign In button on Suno.com');
      }
    }
    
    // Wait for the auth dialog to appear (based on screenshot 2)
    console.log('Waiting for auth dialog...');
    await page.waitForFunction(() => {
      const dialogTitleElement = document.querySelector('h2, h3, h4, .modal-title, .dialog-title');
      return dialogTitleElement && dialogTitleElement.textContent ? 
        dialogTitleElement.textContent.includes('Continue to Suno') : false;
    }, { timeout: 30000 });
    console.log('Auth dialog appeared');
    
    // Click the Google icon (based on screenshot 2)
    console.log('Looking for Google login option...');
    // Try multiple selectors for the Google button
    const googleButtonSelectors = [
      'button[aria-label="Google"]',
      'a[aria-label="Google"]',
      'img[alt="Google"]',
      'button:nth-child(4)' // Based on position in your screenshot
    ];
    
    let googleButtonFound = false;
    for (const selector of googleButtonSelectors) {
      try {
        console.log(`Trying Google button selector: ${selector}`);
        const buttonExists = await page.waitForSelector(selector, { visible: true, timeout: 5000 });
        if (buttonExists) {
          console.log(`Found Google button with selector: ${selector}`);
          await page.click(selector);
          googleButtonFound = true;
          break;
        }
      } catch (error) {
        console.log(`Google button selector ${selector} not found`);
      }
    }
    
    if (!googleButtonFound) {
      // If we can't find the Google button with selectors, try finding by position
      console.log('Google button not found with selectors, trying by position...');
      try {
        // Based on the screenshot, we know it's the 4th button
        const buttons = await page.$$('button');
        if (buttons.length >= 4) {
          console.log(`Found ${buttons.length} buttons, clicking the 4th one...`);
          await buttons[3].click();
          googleButtonFound = true;
        } else {
          throw new Error(`Only found ${buttons.length} buttons, expected at least 4`);
        }
      } catch (error) {
        console.error('Could not find Google button by position:', error);
        throw new Error('Could not find the Google login button');
      }
    }
    
    // Wait for the Google account selection page (based on screenshot 3)
    console.log('Waiting for Google account selection...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check if we're on the account selection screen
    const isAccountSelectionPage = await page.evaluate(() => {
      const headingElement = document.querySelector('[aria-labelledby="headingText"]');
      return headingElement && headingElement.textContent ? 
        headingElement.textContent.includes('Choose an account') : false;
    });
    
    if (isAccountSelectionPage) {
      console.log('On account selection page, selecting account...');
      
      // Select the specific account by email
      const targetEmail = process.env.GOOGLE_EMAIL || '';
      console.log(`Looking for account: ${targetEmail}`);
      
      try {
        // Fix for TS2345 error - use a different approach to pass the email
        const accountFound = await page.evaluate((email) => {
          // Find account elements
          const accountElements = Array.from(document.querySelectorAll('div, span, p'));
          const emailElement = accountElements.find(el => 
            el.textContent && el.textContent.includes(email)
          );
          
          if (emailElement) {
            // Get the parent container that is clickable
            let clickableParent = emailElement;
            for (let i = 0; i < 5; i++) {  // Look up max 5 levels
              if (clickableParent.parentElement) {
                clickableParent = clickableParent.parentElement;
                // Check if this element seems clickable
                if (clickableParent.tagName === 'DIV' && 
                    (clickableParent.getAttribute('role') === 'button' || 
                     clickableParent.classList.contains('OVnw0d'))) {
                  break;
                }
              } else {
                break;
              }
            }
            
            if (clickableParent instanceof HTMLElement) {
              clickableParent.click();
              return true;
            }
            return false;
          }
          return false;
        }, targetEmail);
        
        if (!accountFound) {
          // Use evaluate instead of $x
          console.log('Account not found, clicking "Use another account"...');
          const anotherAccountClicked = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('div, span, p'));
            const anotherAccountElement = elements.find(el => 
              el.textContent && el.textContent.includes('Use another account')
            );
            
            if (anotherAccountElement && anotherAccountElement instanceof HTMLElement) {
              anotherAccountElement.click();
              return true;
            }
            return false;
          });
          
          if (anotherAccountClicked) {
            // Enter email
            console.log('Entering Google email...');
            await page.waitForSelector('input[type="email"]', { timeout: 10000 });
            await page.type('input[type="email"]', process.env.GOOGLE_EMAIL || '');
            await page.keyboard.press('Enter');
            
            // Wait for password field
            console.log('Waiting for password field...');
            await page.waitForSelector('input[type="password"]', { visible: true, timeout: 10000 });
            await page.type('input[type="password"]', process.env.GOOGLE_PASSWORD || '');
            await page.keyboard.press('Enter');
          } else {
            throw new Error('Could not find "Use another account" option');
          }
        }
      } catch (error) {
        console.error('Error selecting account:', error);
        throw new Error('Failed to select or enter Google account');
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
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract authentication token from localStorage
    console.log('Extracting authentication token...');
    const tokenData = await page.evaluate(() => {
      // Create an object to store found tokens
      const foundTokens: Record<string, string | null> = {};
      
      // Check all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('token') || key.includes('auth'))) {
          foundTokens[key] = localStorage.getItem(key);
        }
      }
      
      // Check cookies if no token found in localStorage
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        if (cookie.includes('token') || cookie.includes('auth')) {
          const parts = cookie.split('=');
          if (parts.length >= 2) {
            foundTokens[parts[0].trim()] = parts[1];
          }
        }
      }
      
      // If still not found, dump all localStorage for debugging
      if (Object.keys(foundTokens).length === 0) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            foundTokens[`debug_${i}`] = localStorage.getItem(key);
          }
        }
      }
      
      return foundTokens;
    });
    
    // Extract a token value from the found tokens
    let token = null;
    for (const key in tokenData) {
      if (tokenData[key]) {
        token = tokenData[key];
        console.log(`Found token with key: ${key}`);
        break;
      }
    }
    
    if (!token) {
      console.error('Could not retrieve authentication token');
      console.log('All found storage data:', JSON.stringify(tokenData, null, 2));
      throw new Error('Could not retrieve authentication token');
    }
    
    console.log('Authentication successful');
    return token;
  } catch (error: any) {
    console.error('Authentication error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}