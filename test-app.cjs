const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  console.log('Starting preview server...');
  const server = spawn('npx', ['serve', '-s', 'dist', '-p', '3000']);
  
  await new Promise(r => setTimeout(r, 2000));
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await browser.close();
  server.kill();
})();
