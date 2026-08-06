const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Starting prerender...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, 'build', 'index.html');
  const fileUrl = 'file://' + filePath;

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const content = await page.content();

  fs.writeFileSync(filePath, content);

  await browser.close();
  console.log('Prerender finished.');
})();
