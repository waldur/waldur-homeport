import { describe, expect, it } from 'vitest';

import {
  isSidebarBackgroundDark,
  resolveSidebarStyle,
} from './initSidebarStyle';

describe('resolveSidebarStyle', () => {
  it('passes a literal (non-auto) configured style through unchanged, regardless of theme', () => {
    expect(resolveSidebarStyle('dark', 'light')).toBe('dark');
    expect(resolveSidebarStyle('dark', 'dark')).toBe('dark');
    expect(resolveSidebarStyle('light', 'light')).toBe('light');
    expect(resolveSidebarStyle('accent', 'dark')).toBe('accent');
  });

  it("resolves 'auto' to whichever style shares the page theme's name", () => {
    // Regression test: sidebarColors.css's five styles are all fixed,
    // unconditional looks (see that file's own comment on why an earlier
    // version's [data-theme='dark'] inversion for 'dark'/'light' was a
    // mistaken port, not intentional) — so the plain, name-matching
    // mapping here is correct: 'dark' really does render dark, on any
    // page theme, and likewise for 'light'.
    expect(resolveSidebarStyle('auto', 'light')).toBe('light');
    expect(resolveSidebarStyle('auto', 'dark')).toBe('dark');
  });
});

describe('isSidebarBackgroundDark', () => {
  it("is true for 'dark' and 'accent', regardless of the page theme", () => {
    expect(isSidebarBackgroundDark('dark')).toBe(true);
    expect(isSidebarBackgroundDark('accent')).toBe(true);
  });

  it("is false for 'light', 'primary', and 'accent-light'", () => {
    expect(isSidebarBackgroundDark('light')).toBe(false);
    expect(isSidebarBackgroundDark('primary')).toBe(false);
    expect(isSidebarBackgroundDark('accent-light')).toBe(false);
  });

  it("stays correct for 'auto' end-to-end through resolveSidebarStyle", () => {
    const resolvedOnDarkPage = resolveSidebarStyle('auto', 'dark');
    expect(isSidebarBackgroundDark(resolvedOnDarkPage)).toBe(true);

    const resolvedOnLightPage = resolveSidebarStyle('auto', 'light');
    expect(isSidebarBackgroundDark(resolvedOnLightPage)).toBe(false);
  });
});
