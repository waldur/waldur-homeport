import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The sidebar styles are fixed looks: "dark" always renders dark and "light"
 * always renders light, whatever the app's own light/dark theme is (see the
 * header of sidebarColors.css; the theme only decides *which* style the
 * "auto" setting picks). A theme-scoped rule that sets a style token, or a
 * style block that reads the dark-theme gray ramp, breaks that.
 *
 * It nearly did: `--color-gray-N` used to be overridden per theme, so the
 * style blocks changed with the theme without any rule saying so, and a
 * `--nav-section-label` in surfaceColors.css's dark block silently beat every
 * style's own value.
 *
 * `--surface-sidebar-border` is deliberately not covered: it is the seam
 * between the chrome and the page (TopBar uses it too), so it follows the
 * theme.
 */

const read = (file: string) =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

const rulesOf = (file: string) =>
  [...read(file).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
    props: [...m[2].matchAll(/(--[\w-]+)\s*:/g)].map((p) => p[1]),
  }));

const isStyleToken = (prop: string) =>
  prop.startsWith('--nav-') || prop === '--surface-sidebar-bg';

const FILES = [
  './surfaceColors.css',
  './buttonColors.css',
  './sidebarColors.css',
];

describe('sidebar colours do not depend on the theme', () => {
  it.each(FILES)(
    '%s: no theme-scoped rule sets a sidebar style token',
    (file) => {
      const offenders = rulesOf(file)
        .filter((rule) => rule.selector.includes('data-theme'))
        .flatMap((rule) =>
          rule.props
            .filter(isStyleToken)
            .map((prop) => `${prop} in ${rule.selector}`),
        );
      expect(offenders).toEqual([]);
    },
  );

  it('each style block reads one fixed gray ramp', () => {
    const ramps = (body: string) => [
      ...new Set(
        [...body.matchAll(/var\(--color-(gray-dark|gray)-\d+\)/g)].map(
          (m) => m[1],
        ),
      ),
    ];
    const blocks = rulesOf('./sidebarColors.css').filter((rule) =>
      rule.selector.includes('data-sidebar-style'),
    );
    // dark, light, primary, accent, accent-light
    expect(blocks.length).toBeGreaterThanOrEqual(5);
    for (const block of blocks) {
      expect(block.selector, block.selector).not.toContain('data-theme');
      const used = ramps(block.body);
      expect(
        used.length,
        `${block.selector} mixes gray ramps`,
      ).toBeLessThanOrEqual(1);
      if (block.selector.includes("[data-sidebar-style='dark']")) {
        expect(used, block.selector).toEqual(['gray-dark']);
      }
      if (block.selector.includes("[data-sidebar-style='light']")) {
        expect(used, block.selector).toEqual(['gray']);
      }
    }
  });
});
