// @ts-check
// Plain JavaScript, not TypeScript: an app's vite.config.ts imports this
// through node_modules, where Node will not strip types. Its declarations
// live in vite.d.ts, and the annotations below check this file against them
// (waldur-homeport's tsconfig includes it).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';

/** @typedef {import('./vite.d.ts').BootSplashOptions} BootSplashOptions */

const SCRIPT_NAME = 'boot-splash';

/** @param {string} file */
const read = (file) =>
  readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');

/** @param {string} text */
const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** @type {typeof import('./vite.d.ts').scriptPath} */
export const scriptPath = (base, file) =>
  `${base.endsWith('/') ? base : `${base}/`}${file}`;

/**
 * The built script's file name under `assetsDir`, named by its content like
 * Vite's own assets: nginx serves assets/ as immutable, and a new version
 * gets a new URL from the (never cached) index.html.
 *
 * @type {typeof import('./vite.d.ts').hashedScriptFile}
 */
export const hashedScriptFile = (assetsDir, source = read('boot-splash.js')) =>
  posix.join(
    assetsDir,
    `${SCRIPT_NAME}-${createHash('sha256').update(source).digest('base64url').slice(0, 8)}.js`,
  );

/** @type {typeof import('./vite.d.ts').splashMarkup} */
export const splashMarkup = ({ defaultName = 'Waldur' } = {}) =>
  // A function, so `$` in the name is not read as a replacement pattern.
  read('splash.html').replaceAll('%NAME%', () => escapeHtml(defaultName));

/** @type {typeof import('./vite.d.ts').bootSplashHeadTags} */
export const bootSplashHeadTags = (src) => [
  // Render-blocking on purpose: it brands the splash before the first
  // paint. External, not inline, for `script-src 'self'`.
  { tag: 'script', attrs: { src }, injectTo: 'head' },
  { tag: 'style', children: read('splash.css'), injectTo: 'head' },
  {
    tag: 'noscript',
    children: '<style>.boot-splash { display: none; }</style>',
    injectTo: 'head',
  },
];

/** @type {typeof import('./vite.d.ts').injectBootSplash} */
export const injectBootSplash = (html, src, options = {}) => ({
  html: html.replace(/<\/body>/i, () => `${splashMarkup(options)}</body>`),
  tags: bootSplashHeadTags(src),
});

/**
 * Paints the Waldur boot splash from the first frame: inlines its styles and
 * markup into the app's index.html, and serves (dev) or emits (build) the
 * small script that brands it from the previous visit's cache. Only the
 * app's own index.html is touched: tools that load the same Vite config for
 * another page (Storybook's iframe.html) get no splash that nothing would
 * ever dismiss.
 *
 * @type {typeof import('./vite.d.ts').waldurBootSplash}
 */
export const waldurBootSplash = (options = {}) => {
  /** @type {import('vite').ResolvedConfig} */
  let config;
  let indexHtml = '';
  let builtScript = '';

  const isAppIndex = (/** @type {string} */ filename) =>
    resolve(filename) === indexHtml;

  // Storybook builds with the app's config but its own input (iframe.html).
  const buildsAppIndex = () => {
    const input = config.build.rollupOptions?.input;
    if (!input) {
      return true;
    }
    const inputs =
      typeof input === 'string'
        ? [input]
        : Array.isArray(input)
          ? input
          : Object.values(input);
    return inputs.some((file) => resolve(config.root, file) === indexHtml);
  };

  return {
    name: 'waldur-boot-splash',
    configResolved(resolved) {
      config = resolved;
      indexHtml = resolve(resolved.root, 'index.html');
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.url?.split('?')[0] !== scriptPath(config.base, 'boot-splash.js')
        ) {
          return next();
        }
        res.setHeader('Content-Type', 'text/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(read('boot-splash.js'));
      });
    },
    buildStart() {
      builtScript = '';
      if (config.command !== 'build' || !buildsAppIndex()) {
        return;
      }
      builtScript = hashedScriptFile(config.build.assetsDir);
      this.emitFile({
        type: 'asset',
        fileName: builtScript,
        source: read('boot-splash.js'),
      });
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!isAppIndex(ctx.filename)) {
          return html;
        }
        const file =
          config.command === 'build' ? builtScript : 'boot-splash.js';
        return injectBootSplash(html, scriptPath(config.base, file), options);
      },
    },
  };
};
