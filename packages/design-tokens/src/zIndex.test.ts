import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The z-index tokens exist to sit at specific points in a stack whose other
 * layers live in Bootstrap/Metronic SCSS (see the table in zIndex.css). The
 * constraints are ordering constraints, so that is what is asserted — a
 * re-numbered token can't silently end up under a modal or behind a toast.
 */

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const token = (name: string): number => {
  const m = read('./zIndex.css').match(
    new RegExp(`--z-index-${name}:\\s*(\\d+);`),
  );
  if (!m) {
    throw new Error(`--z-index-${name} not found in zIndex.css`);
  }
  return Number(m[1]);
};

// Bootstrap's own stack (node_modules/bootstrap/scss/_variables.scss).
const BOOTSTRAP = {
  modal: 1055,
  popover: 1070,
  tooltip: 1080,
};
const METRONIC_HEADER = 100;
const METRONIC_TOOLBAR = 99;

describe('z-index tokens', () => {
  it('puts the sidebar panel and mobile drawer above the header, below overlays', () => {
    expect(token('sidebar-panel')).toBeGreaterThan(METRONIC_HEADER);
    expect(token('mobile-drawer')).toBeGreaterThan(METRONIC_HEADER);
    expect(token('mobile-drawer')).toBeLessThan(BOOTSTRAP.modal);
  });

  it('puts header popovers above the header, toolbar and sidebar, below modals', () => {
    expect(token('header-popover')).toBeGreaterThan(METRONIC_HEADER);
    expect(token('header-popover')).toBeGreaterThan(METRONIC_TOOLBAR);
    expect(token('header-popover')).toBeGreaterThan(token('sidebar-panel'));
    expect(token('header-popover')).toBeGreaterThan(token('mobile-drawer'));
    expect(token('header-popover')).toBeLessThan(BOOTSTRAP.modal);
  });

  it('puts nav menus above the header and toolbar, below modals', () => {
    expect(token('nav-menu')).toBeGreaterThan(METRONIC_HEADER);
    expect(token('nav-menu')).toBeGreaterThan(METRONIC_TOOLBAR);
    expect(token('nav-menu')).toBeLessThan(BOOTSTRAP.modal);
  });

  it('keeps the drawer and the desktop panel distinct', () => {
    expect(token('mobile-drawer')).not.toBe(token('sidebar-panel'));
  });

  it('puts date-picker popups above modals and dropdowns, below toasts', () => {
    expect(token('picker-popover')).toBeGreaterThan(BOOTSTRAP.modal);
    expect(token('picker-popover')).toBeGreaterThan(BOOTSTRAP.popover);
    expect(token('picker-popover')).toBeGreaterThan(token('dropdown-menu'));
    expect(token('picker-popover')).toBeLessThan(token('toast'));
  });

  it('puts popovers on the Bootstrap popover layer, above modals, below menus', () => {
    expect(token('popover')).toBe(BOOTSTRAP.popover);
    expect(token('popover')).toBeGreaterThan(BOOTSTRAP.modal);
    expect(token('popover')).toBeGreaterThan(token('header-popover'));
    expect(token('popover')).toBeLessThan(token('dropdown-menu'));
    expect(token('popover')).toBeLessThan(token('picker-popover'));
  });

  it('puts action menus above modals and tooltips, below date pickers', () => {
    expect(token('dropdown-menu')).toBeGreaterThan(BOOTSTRAP.modal);
    expect(token('dropdown-menu')).toBeGreaterThan(BOOTSTRAP.tooltip);
    expect(token('dropdown-menu')).toBeLessThan(token('picker-popover'));
  });

  it('puts toasts above every Bootstrap overlay', () => {
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.modal);
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.popover);
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.tooltip);
    expect(token('toast')).toBeGreaterThan(token('dropdown-menu'));
  });

  it("puts tooltips above toasts so a toast's own tooltip stays visible", () => {
    expect(token('tooltip')).toBeGreaterThan(token('toast'));
  });

  // waldur-ui's cn() teaches tailwind-merge these names, so a caller's
  // `z-<layer>` replaces a component's own `z-50`. A token missing there
  // would let CSS order pick the winner again.
  it("is known to every layer list in waldur-ui's cn()", () => {
    const cn = read('../../ui/src/cn.ts');
    const tokens = [
      ...read('./zIndex.css').matchAll(/--z-index-([\w-]+):/g),
    ].map((m) => m[1]);
    for (const name of new Set(tokens)) {
      expect(cn).toContain(`'${name}'`);
    }
  });

  it("matches the literal default in waldur-ui's Tooltip", () => {
    const tooltip = read('../../ui/src/Tooltip.tsx');
    expect(tooltip).toMatch(new RegExp(`zIndex = ${token('tooltip')},`));
  });
});
