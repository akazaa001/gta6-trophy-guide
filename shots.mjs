// Takes the entry's screenshots: real renders of app/ in headless Chromium.
// Serves app/ with the repo's own serve.ts, drives the guide like a reader
// (ticking trophies, turning the spoiler setting on, scrolling to the roadmap),
// and saves 4 JPEGs into screenshots/. Run: node shots.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = new URL('./screenshots/', import.meta.url).pathname;

mkdirSync(OUT, { recursive: true });

const server = spawn('node', ['serve.ts', '--port', String(PORT)], {
  cwd: new URL('.', import.meta.url).pathname,
  stdio: 'pipe',
});
await new Promise((resolve) => {
  server.stdout.on('data', resolve);
  setTimeout(resolve, 5000);
});

const browser = await chromium.launch();
const shots = [
  {
    file: '1-checklist.jpg',
    setup: async (page) => {
      // Tick ten story trophies (skipping the platinum itself), as a reader
      // part-way through the list, then show the checklist itself: names,
      // descriptions and grades.
      const boxes = page.locator('.card .earn input');
      for (let i = 1; i <= 10; i++) await boxes.nth(i).click();
      await page.locator('.card[data-id="2"]').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -165));
    },
  },
  {
    file: '2-guide.jpg',
    setup: async (page) => {
      // Open the guide at a silver trophy with a count, sources showing.
      await page.locator('.card[data-id="17"]').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -140));
    },
  },
  {
    file: '3-roadmap.jpg',
    setup: async (page) => {
      await page.locator('#roadmap').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -10));
    },
  },
  {
    file: '4-spoiler.jpg',
    setup: async (page) => {
      // Spoiler mode on, story filter: story trophies hide until earned.
      await page.locator('#spoiler').check();
      await page.selectOption('#kind', 'story');
      await page.locator('#cards').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -70));
    },
  },
];

for (const shot of shots) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const external = [];
  page.on('request', (req) => {
    if (!req.url().startsWith(BASE)) external.push(req.url());
  });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await shot.setup(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + shot.file, type: 'jpeg', quality: 82 });
  const size = statSync(OUT + shot.file).size;
  console.log(`${shot.file}: ${size} bytes${external.length ? ` — EXTERNAL REQUESTS: ${external.join(', ')}` : ' — no external requests'}`);
  await context.close();
}

await browser.close();
server.kill();
console.log('done');
