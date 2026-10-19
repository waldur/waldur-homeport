import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import script from './boot-splash.js?raw';

const root = document.documentElement;

// Runs the real script, as the browser does from <head>.
const run = () => new Function(script)();

const cache = (branding: unknown) =>
  localStorage.setItem('waldur/boot-splash', JSON.stringify(branding));

const prop = (name: string) => root.style.getPropertyValue(name);

describe('boot-splash.js', () => {
  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('style');
    [...root.attributes].forEach((attr) => root.removeAttribute(attr.name));
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps the defaults on a first visit', () => {
    run();
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.hasAttribute('data-boot-logo')).toBe(false);
    expect(root.hasAttribute('data-boot-text-name')).toBe(false);
    expect(prop('--boot-brand')).toBe('');
  });

  it('brands the splash from the cache', () => {
    cache({
      name: 'Campus Cloud',
      color: '#7a3fcf',
      logo: 'data:image/webp;base64,AAAA',
    });
    run();
    expect(prop('--boot-brand')).toBe('#7a3fcf');
    expect(prop('--boot-logo')).toBe('url("data:image/webp;base64,AAAA")');
    expect(prop('--boot-text-name')).toBe('"Campus Cloud"');
    expect(prop('--boot-text-status')).toBe('"Starting Campus Cloud…"');
    expect(root.hasAttribute('data-boot-logo')).toBe(true);
    expect(root.hasAttribute('data-boot-text-name')).toBe(true);
    expect(root.hasAttribute('data-boot-text-slow')).toBe(false);
  });

  it('uses the cached translations', () => {
    cache({
      name: 'Campus Cloud',
      texts: {
        status: 'Käivitan: Campus Cloud…',
        slow: 'Võtab tavalisest kauem.',
        reload: 'Laadi uuesti',
      },
    });
    run();
    expect(prop('--boot-text-status')).toBe('"Käivitan: Campus Cloud…"');
    expect(prop('--boot-text-slow')).toBe('"Võtab tavalisest kauem."');
    expect(prop('--boot-text-reload')).toBe('"Laadi uuesti"');
  });

  it('keeps a name from breaking out of its CSS string', () => {
    cache({ name: 'A "quoted"\\ name\n' });
    run();
    expect(prop('--boot-text-name')).toBe('"A  quoted   name "');
  });

  it('ignores a colour that is not a hex colour', () => {
    cache({ color: 'red; background: url(x)' });
    run();
    expect(prop('--boot-brand')).toBe('');
  });

  it('ignores a malformed cache', () => {
    localStorage.setItem('waldur/boot-splash', '{not json');
    expect(run).not.toThrow();
    expect(root.hasAttribute('data-boot-text-name')).toBe(false);
  });

  it('follows the stored theme, then the system one', () => {
    localStorage.setItem('waldur/theme/name', 'dark');
    run();
    expect(root.getAttribute('data-theme')).toBe('dark');

    localStorage.removeItem('waldur/theme/name');
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    run();
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('stays light when the deployment disables the dark theme', () => {
    localStorage.setItem('waldur/theme/name', 'dark');
    cache({ disableDarkTheme: true });
    run();
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('admits a slow load after 8 seconds', () => {
    document.body.innerHTML = `
      <div class="boot-splash boot-splash--static">
        <div class="boot-splash__slow" hidden><button>Reload</button></div>
      </div>`;
    vi.spyOn(performance, 'now').mockReturnValue(0);
    run();
    const notice =
      document.body.querySelector<HTMLElement>('.boot-splash__slow');
    vi.advanceTimersByTime(7999);
    expect(notice.hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(notice.hidden).toBe(false);
  });
});
