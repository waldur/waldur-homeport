#!/usr/bin/env node
// Screenshots every Storybook story in the light and the dark theme, and
// compares two such captures pixel by pixel. Used to check that a design-token
// change moves no pixel it shouldn't, in both themes, by capturing a build of
// the base branch and a build of the change and diffing them.
//
//   node scripts/theme-snapshots.mjs capture <storybook-static> <out-dir> [--filter <regex>] [--font <family>] [--widths <px,px,...>] [--themes <light,dark>]
//   node scripts/theme-snapshots.mjs compare <base-dir> <head-dir> <report-dir>
//
// capture serves the static Storybook itself, opens each story's iframe with
// the `theme` global (the same switch as the toolbar, which swaps the real
// Metronic light/dark stylesheet), waits for that stylesheet and the fonts,
// freezes animations, and writes <story-id>.<theme>.png. --font forces one
// font family everywhere, for comparing two builds that load different web
// fonts: the text then can't differ, so colour changes stand out. --widths
// captures each story once per viewport width (<story-id>.<theme>.w<px>.png),
// for layout changes that differ per breakpoint: 576,768,992,1200 are the
// sm, md, lg and xl breakpoints. --themes limits the themes captured.
//
// compare writes report.json and, for every pair that differs, a
// base | head | changed-pixels-in-red PNG. Exit code 1 when anything differs.
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

import { chromium } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const THEMES = ['light', 'dark'];
const VIEWPORT = { width: 1280, height: 900 };

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serve(root) {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, url);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = path.join(file, 'index.html');
    }
    if (!existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(server)),
  );
}

async function capture(staticDir, outDir, filter, font, widths, themes) {
  const root = path.resolve(staticDir);
  const index = JSON.parse(readFileSync(path.join(root, 'index.json'), 'utf8'));
  const stories = Object.values(index.entries).filter(
    (e) => e.type === 'story' && (!filter || filter.test(e.id)),
  );
  mkdirSync(outDir, { recursive: true });

  const server = await serve(root);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  const failed = [];
  const shots = (widths ?? [null]).flatMap((width) =>
    themes.map((theme) => ({ theme, width })),
  );

  for (const story of stories) {
    for (const { theme, width } of shots) {
      const name = `${story.id}.${theme}${width ? `.w${width}` : ''}.png`;
      await page.setViewportSize(
        width ? { width, height: VIEWPORT.height } : VIEWPORT,
      );
      try {
        await page.goto(
          `${base}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`,
          { waitUntil: 'networkidle' },
        );
        // The theme decorator sets data-theme and injects the Metronic
        // stylesheet (one for both themes); wait until it has loaded, then
        // for fonts.
        await page.waitForFunction(
          (t) =>
            document.documentElement.getAttribute('data-theme') === t &&
            [...document.styleSheets].some((s) =>
              // styles/bootstrap/index.scss (style.scss before #471).
              /\/(index|style)[-.][^/]*\.(s?css)/.test(s.href || ''),
            ),
          theme,
          { timeout: 15000 },
        );
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({
          content:
            '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' +
            (font ? `*,*::before,*::after{font-family:${font}!important}` : ''),
        });
        // Park the pointer: it keeps its spot across stories and widths, and
        // whatever lands under it would show its hover state.
        await page.mouse.move(0, 0);
        await page.waitForTimeout(150);
        await page.screenshot({
          path: path.join(outDir, name),
          fullPage: true,
        });
      } catch (error) {
        failed.push(`${name}: ${error.message.split('\n')[0]}`);
      }
    }
  }

  await browser.close();
  server.close();
  console.log(
    `Captured ${stories.length * shots.length - failed.length} screenshots of ${stories.length} stories to ${outDir}`,
  );
  if (failed.length) {
    console.log(
      `Could not capture ${failed.length}:\n  ${failed.join('\n  ')}`,
    );
  }
}

function readPng(file) {
  return PNG.sync.read(readFileSync(file));
}

function pad(png, width, height) {
  const out = new PNG({ width, height });
  out.data.fill(255);
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

function compare(baseDir, headDir, reportDir) {
  mkdirSync(reportDir, { recursive: true });
  const names = new Set([
    ...readdirSync(baseDir).filter((f) => f.endsWith('.png')),
    ...readdirSync(headDir).filter((f) => f.endsWith('.png')),
  ]);
  const results = [];

  for (const name of [...names].sort()) {
    const a = path.join(baseDir, name);
    const b = path.join(headDir, name);
    if (!existsSync(a) || !existsSync(b)) {
      results.push({
        name,
        status: existsSync(a) ? 'missing in head' : 'new in head',
      });
      continue;
    }
    let base = readPng(a);
    let head = readPng(b);
    const width = Math.max(base.width, head.width);
    const height = Math.max(base.height, head.height);
    const sizeChanged =
      base.width !== head.width || base.height !== head.height;
    base = pad(base, width, height);
    head = pad(head, width, height);
    const diff = new PNG({ width, height });
    // threshold 0.05: antialiasing noise passes, a one-step ramp change does not.
    const changed = pixelmatch(base.data, head.data, diff.data, width, height, {
      threshold: 0.05,
      diffColor: [255, 0, 0],
      alpha: 0.2,
    });
    const ratio = changed / (width * height);
    results.push({
      name,
      status: changed === 0 && !sizeChanged ? 'same' : 'changed',
      changedPixels: changed,
      ratio: Number(ratio.toFixed(5)),
      sizeChanged,
    });
    if (changed > 0 || sizeChanged) {
      const sheet = new PNG({ width: width * 3, height });
      sheet.data.fill(255);
      PNG.bitblt(base, sheet, 0, 0, width, height, 0, 0);
      PNG.bitblt(head, sheet, 0, 0, width, height, width, 0);
      PNG.bitblt(diff, sheet, 0, 0, width, height, width * 2, 0);
      writeFileSync(path.join(reportDir, name), PNG.sync.write(sheet));
    }
  }

  writeFileSync(
    path.join(reportDir, 'report.json'),
    JSON.stringify(results, null, 2),
  );
  const changed = results.filter((r) => r.status !== 'same');
  for (const theme of THEMES) {
    const ofTheme = results.filter((r) =>
      new RegExp(`\\.${theme}(\\.w\\d+)?\\.png$`).test(r.name),
    );
    if (!ofTheme.length) continue;
    const diffs = ofTheme.filter((r) => r.status !== 'same');
    console.log(
      `${theme}: ${ofTheme.length - diffs.length} same, ${diffs.length} changed`,
    );
  }
  for (const r of changed.sort((x, y) => (y.ratio ?? 1) - (x.ratio ?? 1))) {
    console.log(
      `  ${r.name}  ${r.status}${r.ratio !== undefined ? ` ${(r.ratio * 100).toFixed(3)}%` : ''}${r.sizeChanged ? ' (size changed)' : ''}`,
    );
  }
  return changed.length === 0;
}

const [command, ...args] = process.argv.slice(2);
if (command === 'capture' && args.length >= 2) {
  const option = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : null;
  };
  const filter = option('--filter');
  const widths = option('--widths');
  const themes = option('--themes');
  await capture(
    args[0],
    args[1],
    filter ? new RegExp(filter) : null,
    option('--font'),
    widths ? widths.split(',').map(Number) : null,
    themes ? themes.split(',') : THEMES,
  );
} else if (command === 'compare' && args.length === 3) {
  process.exit(compare(args[0], args[1], args[2]) ? 0 : 1);
} else {
  console.error(
    'Usage:\n  theme-snapshots.mjs capture <storybook-static> <out-dir> [--filter <regex>] [--font <family>] [--widths <px,px,...>] [--themes <light,dark>]\n  theme-snapshots.mjs compare <base-dir> <head-dir> <report-dir>',
  );
  process.exit(2);
}
