#!/usr/bin/env node
// Screenshots every Storybook story in the light and the dark theme, and
// compares two such captures pixel by pixel. Used to check that a design-token
// change moves no pixel it shouldn't, in both themes, by capturing a build of
// the base branch and a build of the change and diffing them.
//
//   node scripts/theme-snapshots.mjs capture <storybook-static> <out-dir> [--filter <regex>] [--font <family>] [--widths <px,px,...>] [--themes <light,dark>] [--styles]
//   node scripts/theme-snapshots.mjs compare <base-dir> <head-dir> <report-dir>
//   node scripts/theme-snapshots.mjs root-invariance <storybook-static> <out-dir> [--filter <regex>] [--widths …] [--themes …] [--roots <px,px>]
//
// capture serves the static Storybook itself, opens each story's iframe with
// the `theme` global (the same switch as the toolbar, which sets data-theme
// for the Bootstrap stylesheet and Tailwind alike), waits for it and the fonts,
// freezes animations, and writes <story-id>.<theme>.png. --font forces one
// font family everywhere, for comparing two builds that load different web
// fonts: the text then can't differ, so colour changes stand out. --widths
// captures each story once per viewport width (<story-id>.<theme>.w<px>.png),
// for layout changes that differ per breakpoint: 576,768,992,1200 are the
// sm, md, lg and xl breakpoints. --themes limits the themes captured.
// --root <px> forces html's font size (the rem root) before the story loads,
// overriding the 13px HomePort forces.
//
// --styles also writes <story-id>.<theme>.styles.json: the computed style of
// every element the story renders (portals included), keyed by its DOM path.
// A pixel diff shows that something moved; this names the element and the
// property (`div>pre>div  margin-top  3px → 0px`), and catches a change too
// small for the pixel threshold. Meant for refactors that should change no
// style at all, such as moving a stylesheet's rules into utilities.
//
// compare writes report.json and, for every pair that differs, a
// base | head | changed-pixels-in-red PNG. When both sides captured styles it
// also lists every property that changed, in report.json (`styles`) and on
// the console. Exit code 1 when anything differs.
//
// root-invariance captures the build twice, with html's font size forced to
// 13px and to 20px (--roots), into <out-dir>/root-<px>, and compares the two
// into <out-dir>/report. A story that differs still sizes something in rem:
// the list is what stands between HomePort and the browser's default root
// (docs/design-tokens.md → "Root font size"). Not a CI gate yet.
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

async function capture(
  staticDir,
  outDir,
  filter,
  font,
  widths,
  themes,
  rootPx,
  styles = false,
) {
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
  if (rootPx) {
    // An inline !important outranks the stylesheets' `html { font-size:
    // 13px !important }`, layered or not. Set before any script runs, so a
    // component that measures itself on mount sees the forced root too.
    await page.addInitScript((px) => {
      const apply = () =>
        document.documentElement.style.setProperty(
          'font-size',
          `${px}px`,
          'important',
        );
      if (document.documentElement) apply();
      else {
        new MutationObserver((_, observer) => {
          if (!document.documentElement) return;
          apply();
          observer.disconnect();
        }).observe(document, { childList: true });
      }
    }, rootPx);
  }
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
        // The stylesheets are static imports of the Storybook preview, loaded
        // before the story renders; wait for the theme decorator to set
        // data-theme, then for fonts.
        await page.waitForFunction(
          (t) => document.documentElement.getAttribute('data-theme') === t,
          theme,
          { timeout: 15000 },
        );
        await page.evaluate(() => document.fonts.ready);
        if (rootPx) {
          const actual = await page.evaluate(
            () => getComputedStyle(document.documentElement).fontSize,
          );
          if (actual !== `${rootPx}px`) {
            throw new Error(`html font-size is ${actual}, not ${rootPx}px`);
          }
        }
        await page.addStyleTag({
          content:
            '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' +
            (font
              ? `*,*::before,*::after{font-family:${font}!important}`
              : '') +
            // Storybook pads the canvas by 1rem: pin it, or every story
            // shifts with the root and the stories' own rem is lost in it.
            (rootPx ? '.sb-main-padded{padding:16px!important}' : ''),
        });
        // Park the pointer: it keeps its spot across stories and widths, and
        // whatever lands under it would show its hover state.
        await page.mouse.move(0, 0);
        await page.waitForTimeout(150);
        await page.screenshot({
          path: path.join(outDir, name),
          fullPage: true,
        });
        if (styles) {
          writeFileSync(
            path.join(outDir, name.replace(/\.png$/, '.styles.json')),
            JSON.stringify(await page.evaluate(collectStyles, STYLE_PROPS)),
          );
        }
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

// The properties --styles records: what a stylesheet-to-utilities move can
// change. Longhands, since a shorthand's computed value is often empty.
const STYLE_PROPS = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'box-sizing',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background-color',
  'background-image',
  'color',
  'opacity',
  'box-shadow',
  'outline-style',
  'outline-width',
  'outline-color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'text-decoration-line',
  'text-overflow',
  'white-space',
  'vertical-align',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'justify-content',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'overflow-x',
  'overflow-y',
  'transform',
  'visibility',
  'cursor',
  'pointer-events',
  'object-fit',
];

// Runs in the page: { "<path>": { prop: value } } for every element under
// <body> except Storybook's own and non-rendering ones. The path is each
// ancestor's tag and position among its siblings, so the same markup gets
// the same keys in two builds, and the class names, which a refactor
// changes, stay out of it.
function collectStyles(props) {
  const out = {};
  const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE']);
  const walk = (el, prefix) => {
    [...el.children].forEach((child, i) => {
      if (skip.has(child.tagName) || child.id === 'storybook-docs') return;
      const key = `${prefix}${prefix ? '>' : ''}${child.tagName.toLowerCase()}:${i}`;
      const cs = getComputedStyle(child);
      out[key] = Object.fromEntries(
        props.map((p) => [p, cs.getPropertyValue(p)]),
      );
      walk(child, key);
    });
  };
  walk(document.body, '');
  return out;
}

// Every property that differs between two collectStyles() results, and the
// elements only one of them has (the markup changed).
function diffStyles(base, head) {
  const changes = [];
  for (const key of new Set([...Object.keys(base), ...Object.keys(head)])) {
    if (!base[key] || !head[key]) {
      changes.push({ element: key, change: base[key] ? 'removed' : 'added' });
      continue;
    }
    for (const prop of Object.keys(base[key])) {
      if (base[key][prop] !== head[key][prop]) {
        changes.push({
          element: key,
          property: prop,
          base: base[key][prop],
          head: head[key][prop],
        });
      }
    }
  }
  return changes;
}

function compareStyles(baseDir, headDir) {
  const names = readdirSync(baseDir).filter(
    (f) => f.endsWith('.styles.json') && existsSync(path.join(headDir, f)),
  );
  const results = [];
  for (const name of names.sort()) {
    const read = (dir) =>
      JSON.parse(readFileSync(path.join(dir, name), 'utf8'));
    const changes = diffStyles(read(baseDir), read(headDir));
    if (changes.length) results.push({ name, changes });
  }
  return { compared: names.length, results };
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

  const styles = compareStyles(baseDir, headDir);
  writeFileSync(
    path.join(reportDir, 'report.json'),
    JSON.stringify(
      styles.compared
        ? { screenshots: results, styles: styles.results }
        : results,
      null,
      2,
    ),
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
  if (styles.compared) {
    console.log(
      `styles: ${styles.compared - styles.results.length} same, ${styles.results.length} changed`,
    );
    for (const { name, changes } of styles.results) {
      console.log(`  ${name}`);
      for (const c of changes.slice(0, 20)) {
        console.log(
          c.property
            ? `    ${c.element}  ${c.property}  ${c.base} → ${c.head}`
            : `    ${c.element}  ${c.change}`,
        );
      }
      if (changes.length > 20) {
        console.log(`    … ${changes.length - 20} more in report.json`);
      }
    }
  }
  return changed.length === 0 && styles.results.length === 0;
}

const [command, ...args] = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const captureOptions = () => {
  const filter = option('--filter');
  const widths = option('--widths');
  const themes = option('--themes');
  return {
    filter: filter ? new RegExp(filter) : null,
    font: option('--font'),
    widths: widths ? widths.split(',').map(Number) : null,
    themes: themes ? themes.split(',') : THEMES,
    styles: args.includes('--styles'),
  };
};
if (command === 'capture' && args.length >= 2) {
  const { filter, font, widths, themes, styles } = captureOptions();
  const root = option('--root');
  await capture(
    args[0],
    args[1],
    filter,
    font,
    widths,
    themes,
    root ? Number(root) : null,
    styles,
  );
} else if (command === 'root-invariance' && args.length >= 2) {
  const { filter, font, widths, themes } = captureOptions();
  const [low, high] = (option('--roots') ?? '13,20').split(',').map(Number);
  const dir = (px) => path.join(args[1], `root-${px}`);
  for (const px of [low, high]) {
    await capture(args[0], dir(px), filter, font, widths, themes, px);
  }
  console.log(`\nStories that differ between a ${low}px and a ${high}px root:`);
  process.exit(
    compare(dir(low), dir(high), path.join(args[1], 'report')) ? 0 : 1,
  );
} else if (command === 'compare' && args.length === 3) {
  process.exit(compare(args[0], args[1], args[2]) ? 0 : 1);
} else {
  console.error(
    'Usage:\n  theme-snapshots.mjs capture <storybook-static> <out-dir> [--filter <regex>] [--font <family>] [--widths <px,px,...>] [--themes <light,dark>] [--root <px>] [--styles]\n  theme-snapshots.mjs compare <base-dir> <head-dir> <report-dir>\n  theme-snapshots.mjs root-invariance <storybook-static> <out-dir> [--filter <regex>] [--widths <px,px,...>] [--themes <light,dark>] [--roots <px,px>]',
  );
  process.exit(2);
}
