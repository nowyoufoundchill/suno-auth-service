import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer-core';

// Register the stealth plugin
puppeteerExtra.use(StealthPlugin());

// Launch browser with the correct executable path
const browser = await puppeteerExtra.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true
});

// When launching, specify the path to Chromium
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium-browser', // This path works on Railway
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Suno Auth Service is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Suno Auth Service is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});