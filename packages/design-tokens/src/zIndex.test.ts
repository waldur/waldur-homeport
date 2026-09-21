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

// Bootstrap's own stack (node_modules/bootstrap/scss/_variables.scss) and the
// app's `.dropdown-menu` override (metronic/sass/custom/_button-group.scss).
const BOOTSTRAP = {
  modal: 1055,
  popover: 1070,
  tooltip: 1080,
  appDropdownMenu: 1100,
};
const METRONIC_HEADER = 100;

describe('z-index tokens', () => {
  it('puts the sidebar panel and mobile drawer above the header, below overlays', () => {
    expect(token('sidebar-panel')).toBeGreaterThan(METRONIC_HEADER);
    expect(token('mobile-drawer')).toBeGreaterThan(METRONIC_HEADER);
    expect(token('mobile-drawer')).toBeLessThan(BOOTSTRAP.modal);
  });

  it('keeps the drawer and the desktop panel distinct', () => {
    expect(token('mobile-drawer')).not.toBe(token('sidebar-panel'));
  });

  it('puts toasts above every Bootstrap overlay', () => {
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.modal);
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.popover);
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.tooltip);
    expect(token('toast')).toBeGreaterThan(BOOTSTRAP.appDropdownMenu);
  });

  it("puts tooltips above toasts so a toast's own tooltip stays visible", () => {
    expect(token('tooltip')).toBeGreaterThan(token('toast'));
  });

  it("matches the literal default in waldur-ui's Tooltip", () => {
    const tooltip = read('../../ui/src/Tooltip.tsx');
    expect(tooltip).toMatch(new RegExp(`zIndex = ${token('tooltip')},`));
  });
});
