import { Browser } from 'puppeteer';

/**
 * Test if Puppeteer can launch a browser
 */
export async function testBrowser(): Promise<string> {
  let browser: Browser | null = null;
  let result = '';
  
  try {
    console.log('Testing browser capabilities...');
    
    try {
      // Try to use puppeteer (not puppeteer-core)
      console.log('Attempting to require puppeteer...');
      const puppeteer = require('puppeteer');
      console.log('Puppeteer loaded, launching browser...');
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      console.log('Browser launched successfully!');
      result += 'Successfully launched browser with puppeteer. ';
      
      // Test basic navigation
      if (browser) {  // Add null check here
        const page = await browser.newPage();
        console.log('Navigating to example.com...');
        await page.goto('https://example.com');
        const title = await page.title();
        console.log(`Page loaded: ${title}`);
        result += `Page title: "${title}". `;
        
        // Test JavaScript execution
        const jsVersion = await page.evaluate(() => {
          return navigator.userAgent;
        });
        console.log(`User agent: ${jsVersion}`);
        result += `User agent: ${jsVersion}`;
      } else {
        throw new Error('Browser is null after launch');
      }
      
      return result;
    } catch (error: any) {
      console.error('Error with puppeteer:', error);
      result += `Error with puppeteer: ${error.message}. `;
      
      // Try with puppeteer-extra and various browser paths
      console.log('Trying puppeteer-extra...');
      const puppeteerExtra = require('puppeteer-extra');
      const StealthPlugin = require('puppeteer-extra-plugin-stealth');
      puppeteerExtra.use(StealthPlugin());
      
      // Test browser paths
      const paths = [
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable'
      ];
      
      let pathSuccess = false;
      for (const path of paths) {
        try {
          console.log(`Testing path: ${path}`);
          const exists = require('fs').existsSync(path);
          console.log(`Path exists: ${exists}`);
          
          if (exists) {
            browser = await puppeteerExtra.launch({
              executablePath: path,
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            if (browser) {  // Add null check here
              console.log(`Successfully launched with ${path}`);
              result += `Successfully launched browser at ${path}. `;
              pathSuccess = true;
              break;
            }
          }
        } catch (e: any) {
          console.log(`Failed with ${path}: ${e.message}`);
          result += `Failed with ${path}: ${e.message}. `;
        }
      }
      
      if (!pathSuccess) {
        result += 'All browser paths failed. ';
        throw new Error('Could not launch browser with any path');
      }
      
      return result;
    }
  } catch (error: any) {
    console.error('Browser test failed:', error);
    result += `Final error: ${error.message}`;
    throw error;
  } finally {
    if (browser) {  // This null check was already here
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed');
    }
  }
}