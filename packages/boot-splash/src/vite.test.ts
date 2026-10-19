// @vitest-environment node
// The plugin runs in Node (inside vite.config), and reads its files by
// import.meta.url, which jsdom rewrites.
import { describe, expect, it } from 'vitest';

import {
  hashedScriptFile,
  injectBootSplash,
  scriptPath,
  waldurBootSplash,
} from './vite';

const page = '<html><head></head><body><div id="root"></div></body></html>';

const setUp = ({
  command = 'build',
  input = undefined,
}: { command?: string; input?: unknown } = {}) => {
  const plugin = waldurBootSplash({ defaultName: 'Campus Cloud' }) as any;
  plugin.configResolved({
    root: '/app',
    base: '/micro-app-poc/',
    command,
    build: { assetsDir: 'assets', rollupOptions: { input } },
  });
  const emitted = [];
  plugin.buildStart.call({ emitFile: (file) => emitted.push(file) });
  const transform = (filename: string) =>
    plugin.transformIndexHtml.handler(page, { filename });
  return { emitted, transform };
};

describe('injectBootSplash', () => {
  it('loads the branding script render-blocking in the head', () => {
    const { tags } = injectBootSplash(page, '/assets/boot-splash-x.js');
    const script = tags.find((tag) => tag.tag === 'script');
    expect(script).toMatchObject({
      attrs: { src: '/assets/boot-splash-x.js' },
      injectTo: 'head',
    });
    expect(script.attrs).not.toHaveProperty('defer');
    expect(script.attrs).not.toHaveProperty('type');
  });

  it('inlines the splash styles into the head', () => {
    const { tags } = injectBootSplash(page, '/boot-splash.js');
    const style = tags.find((tag) => tag.tag === 'style');
    expect(style.injectTo).toBe('head');
    expect(style.children).toContain('.boot-splash--static');
  });

  it('adds the splash markup last in the body, outside the app root', () => {
    const { html } = injectBootSplash(page, '/boot-splash.js');
    expect(html).toMatch(
      /<div id="root"><\/div>[\s\S]*id="boot-splash"[\s\S]*<\/body>/,
    );
  });

  it('fills in the default name, escaped', () => {
    const { html } = injectBootSplash(page, '/boot-splash.js', {
      defaultName: 'R&D <Cloud> $&',
    });
    expect(html).toContain('R&amp;D &lt;Cloud&gt; $&amp;');
    expect(html).not.toContain('%NAME%');
  });
});

describe('scriptPath and hashedScriptFile', () => {
  it('places a file under any base', () => {
    expect(scriptPath('/', 'a.js')).toBe('/a.js');
    expect(scriptPath('./', 'a.js')).toBe('./a.js');
    expect(scriptPath('/app', 'a.js')).toBe('/app/a.js');
  });

  it('names the built script by its content, under assets', () => {
    expect(hashedScriptFile('assets', 'one')).toMatch(
      /^assets\/boot-splash-[\w-]{8}\.js$/,
    );
    expect(hashedScriptFile('assets', 'one')).toBe(
      hashedScriptFile('assets', 'one'),
    );
    expect(hashedScriptFile('assets', 'one')).not.toBe(
      hashedScriptFile('assets', 'two'),
    );
  });
});

describe('waldurBootSplash', () => {
  it('emits the branding script as a content-hashed asset and links it', () => {
    const { emitted, transform } = setUp();
    expect(emitted).toEqual([
      expect.objectContaining({
        type: 'asset',
        fileName: expect.stringMatching(/^assets\/boot-splash-[\w-]{8}\.js$/),
        source: expect.stringContaining("'waldur/boot-splash'"),
      }),
    ]);
    const { tags } = transform('/app/index.html');
    expect(tags[0].attrs.src).toBe(`/micro-app-poc/${emitted[0].fileName}`);
  });

  it('serves the script unhashed in dev', () => {
    const { emitted, transform } = setUp({ command: 'serve' });
    expect(emitted).toEqual([]);
    expect(transform('/app/index.html').tags[0].attrs.src).toBe(
      '/micro-app-poc/boot-splash.js',
    );
  });

  it("leaves other pages alone, such as Storybook's iframe.html", () => {
    const { transform } = setUp();
    expect(transform('/app/node_modules/storybook/assets/iframe.html')).toBe(
      page,
    );
  });

  it('emits nothing for a build of another page', () => {
    const { emitted } = setUp({ input: '/sb/iframe.html' });
    expect(emitted).toEqual([]);
  });

  it('emits for an explicit input that includes the app index', () => {
    const { emitted } = setUp({ input: { main: 'index.html' } });
    expect(emitted).toHaveLength(1);
  });
});
