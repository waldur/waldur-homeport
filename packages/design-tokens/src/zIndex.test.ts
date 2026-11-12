import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The z-index tokens exist to sit at specific points in a stack (see the table
 * in zIndex.css). The constraints are ordering constraints, so that is what is
 * asserted — a re-numbered token can't silently end up under a modal or behind
 * a toast.
 */

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const token = (name: string): number => {
  const m = read('./css/primitives/zIndex.css').match(
    new RegExp(`--z-index-${name}:\\s*(\\d+);`),
  );
  if (!m) {
    throw new Error(`--z-index-${name} not found in zIndex.css`);
  }
  return Number(m[1]);
};

// Reference overlay stack heights.
const OVERLAY_STACK = {
  modal: 1055,
  popover: 1070,
  tooltip: 1080,
};
const TOOLBAR_ZINDEX = 99;

describe('z-index tokens', () => {
  it('puts the header above the page tabs, below the sidebar panel and drawer', () => {
    expect(token('header')).toBeGreaterThan(TOOLBAR_ZINDEX);
    expect(token('header')).toBeLessThan(token('sidebar-panel'));
    // AppHeader lifts it to the drawer's + 1 while a drawer is open, which
    // must still sit under the header's own popovers.
    expect(token('mobile-drawer') + 1).toBeLessThan(token('header-popover'));
  });

  it('puts the sidebar panel and mobile drawer above the header, below overlays', () => {
    expect(token('sidebar-panel')).toBeGreaterThan(token('header'));
    expect(token('mobile-drawer')).toBeGreaterThan(token('header'));
    expect(token('mobile-drawer')).toBeLessThan(OVERLAY_STACK.modal);
  });

  it('puts header popovers above the header, toolbar and sidebar, below modals', () => {
    expect(token('header-popover')).toBeGreaterThan(token('header'));
    expect(token('header-popover')).toBeGreaterThan(TOOLBAR_ZINDEX);
    expect(token('header-popover')).toBeGreaterThan(token('sidebar-panel'));
    expect(token('header-popover')).toBeGreaterThan(token('mobile-drawer'));
    expect(token('header-popover')).toBeLessThan(OVERLAY_STACK.modal);
  });

  it('puts nav menus above the header and toolbar, below modals', () => {
    expect(token('nav-menu')).toBeGreaterThan(token('header'));
    expect(token('nav-menu')).toBeGreaterThan(TOOLBAR_ZINDEX);
    expect(token('nav-menu')).toBeLessThan(OVERLAY_STACK.modal);
  });

  it('keeps the drawer and the desktop panel distinct', () => {
    expect(token('mobile-drawer')).not.toBe(token('sidebar-panel'));
  });

  it('puts date-picker popups above modals and dropdowns, below toasts', () => {
    expect(token('picker-popover')).toBeGreaterThan(OVERLAY_STACK.modal);
    expect(token('picker-popover')).toBeGreaterThan(OVERLAY_STACK.popover);
    expect(token('picker-popover')).toBeGreaterThan(token('dropdown-menu'));
    expect(token('picker-popover')).toBeLessThan(token('toast'));
  });

  it('puts popovers on the popover layer, above modals, below menus', () => {
    expect(token('popover')).toBe(OVERLAY_STACK.popover);
    expect(token('popover')).toBeGreaterThan(OVERLAY_STACK.modal);
    expect(token('popover')).toBeGreaterThan(token('header-popover'));
    expect(token('popover')).toBeLessThan(token('dropdown-menu'));
    expect(token('popover')).toBeLessThan(token('picker-popover'));
  });

  it('puts action menus above modals and tooltips, below date pickers', () => {
    expect(token('dropdown-menu')).toBeGreaterThan(OVERLAY_STACK.modal);
    expect(token('dropdown-menu')).toBeGreaterThan(OVERLAY_STACK.tooltip);
    expect(token('dropdown-menu')).toBeLessThan(token('picker-popover'));
  });

  it('puts the modal on modal layers, a confirm above it', () => {
    expect(token('modal')).toBe(OVERLAY_STACK.modal);
    expect(token('modal-backdrop')).toBeLessThan(token('modal'));
    expect(token('modal-backdrop')).toBeGreaterThan(token('header-popover'));
    expect(token('confirm-backdrop')).toBeGreaterThan(token('modal'));
    expect(token('confirm')).toBeGreaterThan(token('confirm-backdrop'));
  });

  it('puts popovers, menus and pickers above a confirm over a modal', () => {
    expect(token('popover')).toBeGreaterThan(token('confirm'));
    expect(token('dropdown-menu')).toBeGreaterThan(token('confirm'));
    expect(token('picker-popover')).toBeGreaterThan(token('confirm'));
  });

  it('puts toasts above every overlay', () => {
    expect(token('toast')).toBeGreaterThan(OVERLAY_STACK.modal);
    expect(token('toast')).toBeGreaterThan(OVERLAY_STACK.popover);
    expect(token('toast')).toBeGreaterThan(OVERLAY_STACK.tooltip);
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
      ...read('./css/primitives/zIndex.css').matchAll(/--z-index-([\w-]+):/g),
    ].map((m) => m[1]);
    for (const name of new Set(tokens)) {
      expect(cn).toContain(`'${name}'`);
    }
  });

  it("matches the literal default in waldur-ui's Tooltip", () => {
    const tooltip = read('../../ui/src/Tooltip/Tooltip.tsx');
    expect(tooltip).toMatch(new RegExp(`zIndex = ${token('tooltip')},`));
  });
});
