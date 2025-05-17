import { execSync } from 'child_process';
import fs from 'fs';

export interface DebugInfo {
  environment: {
    node: string;
    platform: string;
    arch: string;
    versions: NodeJS.ProcessVersions;
    env: Record<string, string | undefined>;
  };
  directories: {
    cwd: string;
    files: string[];
  };
  browsers: {
    puppeteerAvailable: boolean;
    puppeteerExtraAvailable: boolean;
    stealthPluginAvailable: boolean;
    paths: Record<string, boolean>;
    shellCommands: Record<string, string>;
  };
  packages: Record<string, string>;
}

export async function getDebugInfo(): Promise<DebugInfo> {
  // Environment info
  const environment = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
    env: {
      PATH: process.env.PATH,
      NODE_ENV: process.env.NODE_ENV,
      // Don't include sensitive info like API keys or credentials
    }
  };

  // Directory info
  const cwd = process.cwd();
  let files: string[] = [];
  try {
    files = fs.readdirSync(cwd);
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  // Browser checks
  const browserPaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/opt/google/chrome/chrome'
  ];

  const pathExists: Record<string, boolean> = {};
  for (const path of browserPaths) {
    try {
      pathExists[path] = fs.existsSync(path);
    } catch (error) {
      pathExists[path] = false;
    }
  }

  // Shell commands
  const shellCommands: Record<string, string> = {};
  const commands = [
    'which chromium',
    'which google-chrome',
    'ls -la /usr/bin | grep chrom',
    'ls -la /opt | grep chrome'
  ];

  for (const cmd of commands) {
    try {
      shellCommands[cmd] = execSync(cmd).toString().trim();
    } catch (error) {
      shellCommands[cmd] = `Error: ${error.message}`;
    }
  }

  // Package checks
  let puppeteerAvailable = false;
  let puppeteerExtraAvailable = false;
  let stealthPluginAvailable = false;

  try {
    require('puppeteer');
    puppeteerAvailable = true;
  } catch (error) {
    // Puppeteer not available
  }

  try {
    require('puppeteer-extra');
    puppeteerExtraAvailable = true;
  } catch (error) {
    // Puppeteer-extra not available
  }

  try {
    require('puppeteer-extra-plugin-stealth');
    stealthPluginAvailable = true;
  } catch (error) {
    // Stealth plugin not available
  }

  // Installed packages
  const packages: Record<string, string> = {};
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    packages.dependencies = JSON.stringify(packageJson.dependencies);
    packages.devDependencies = JSON.stringify(packageJson.devDependencies);
  } catch (error) {
    packages.error = `Error reading package.json: ${error.message}`;
  }

  return {
    environment,
    directories: {
      cwd,
      files
    },
    browsers: {
      puppeteerAvailable,
      puppeteerExtraAvailable,
      stealthPluginAvailable,
      paths: pathExists,
      shellCommands
    },
    packages
  };
}