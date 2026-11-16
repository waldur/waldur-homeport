import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import {
  getSidebarWidthStyle,
  useSidebarLayoutShim,
} from './useSidebarLayoutShim';

let mockSidebarState: 'expanded' | 'collapsed' = 'expanded';
let mockOpen = true;
let mockMobile = false;
const setOpen = vi.fn((value: boolean) => {
  mockOpen = value;
  mockSidebarState = value ? 'expanded' : 'collapsed';
});
let mockTheme: 'dark' | 'light' = 'dark';

// The page's width: the layout's page region, or the window outside it.
let mockPageWidth = 1600;

vi.mock('waldur-ui', () => ({
  usePageBreakpointUp: (px: number) => mockPageWidth >= px,
  useSidebar: () => ({
    state: mockSidebarState,
    open: mockOpen,
    setOpen,
    isMobile: mockMobile,
  }),
}));

const applySidebarStyle = vi.fn();
// Matches the real resolveSidebarStyle() (waldur-design-tokens) — 'auto'
// resolves to whichever of 'dark'/'light' shares the page theme's name;
// see that function's own comment for why this simple mapping is correct.
vi.mock('waldur-design-tokens', () => ({
  applySidebarStyle: (...args: unknown[]) => applySidebarStyle(...args),
  resolveSidebarStyle: (configured: string, theme: string) =>
    configured === 'auto' ? (theme === 'dark' ? 'dark' : 'light') : configured,
}));

let mockBesidePage = false;
vi.mock('@/drawer/actions', () => ({
  useOptionalDrawer: () => ({ besidePage: mockBesidePage }),
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

describe('useSidebarLayoutShim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSidebarState = 'expanded';
    mockOpen = true;
    mockMobile = false;
    mockTheme = 'dark';
    mockPageWidth = 1600;
    mockBesidePage = false;
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
  });

  it('applies the resolved sidebar style token on mount', () => {
    renderHook(() => useSidebarLayoutShim());

    expect(applySidebarStyle).toHaveBeenCalledWith('dark');
  });

  it('markUserToggled stops the auto-minimize from firing', () => {
    const { result, rerender } = renderHook(() => useSidebarLayoutShim());
    result.current.markUserToggled();
    setOpen.mockClear();

    mockPageWidth = 1000;
    rerender();

    expect(setOpen).not.toHaveBeenCalled();
  });

  it('auto-minimizes on a medium desktop width when open', () => {
    mockOpen = true;
    const { rerender } = renderHook(() => useSidebarLayoutShim());
    setOpen.mockClear();

    mockPageWidth = 1000;
    rerender();

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("goes by the page's width: a docked drawer narrows it as a window would", () => {
    mockOpen = true;
    mockPageWidth = 900;
    renderHook(() => useSidebarLayoutShim());

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('collapses to its rail at any width beside a docked drawer', () => {
    // A page the drawer leaves 700px: below 768px a window would turn the
    // sidebar into a sheet, which a wide window's header offers no button for.
    mockPageWidth = 700;
    mockOpen = true;
    const { rerender } = renderHook(() => useSidebarLayoutShim());
    expect(setOpen).not.toHaveBeenCalled();

    mockBesidePage = true;
    rerender();

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('auto-expands on a wide desktop width when collapsed', () => {
    mockOpen = false;
    mockSidebarState = 'collapsed';
    mockPageWidth = 1000;
    const { rerender } = renderHook(() => useSidebarLayoutShim());
    setOpen.mockClear();

    mockPageWidth = 1500;
    rerender();

    expect(setOpen).toHaveBeenCalledWith(true);
  });

  it('acts only when a threshold is crossed, not as the sidebar toggles', () => {
    mockOpen = true;
    const { rerender } = renderHook(() => useSidebarLayoutShim());
    setOpen.mockClear();

    // The user collapsing it on a wide page is left alone.
    mockOpen = false;
    mockSidebarState = 'collapsed';
    rerender();

    expect(setOpen).not.toHaveBeenCalled();
  });

  it("counts a classic scrollbar back in, as the window's width does", () => {
    // A 1410px window with a 15px scrollbar: the page region is 1395px, the
    // window still wide enough to keep the sidebar open.
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1410,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1395,
    });
    mockPageWidth = 1395;
    mockOpen = true;
    renderHook(() => useSidebarLayoutShim());

    expect(setOpen).not.toHaveBeenCalled();
    // jsdom's own values back.
    delete (document.documentElement as any).clientWidth;
  });

  it('publishes the width the sidebar takes on <html> and removes it on unmount', () => {
    const style = document.documentElement.style;
    mockSidebarState = 'collapsed';
    const { rerender, unmount } = renderHook(() => useSidebarLayoutShim());
    expect(style.getPropertyValue('--layout-sidebar-width')).toBe(
      'var(--sidebar-width-icon)',
    );

    mockSidebarState = 'expanded';
    rerender();
    expect(style.getPropertyValue('--layout-sidebar-width')).toBe(
      'var(--sidebar-width)',
    );

    unmount();
    expect(style.getPropertyValue('--layout-sidebar-width')).toBe('');
  });
});

describe('getSidebarWidthStyle', () => {
  it('is the full or icon-rail width on desktop, none on a phone', () => {
    expect(getSidebarWidthStyle(false, false)).toEqual({
      '--layout-sidebar-width': 'var(--sidebar-width)',
    });
    expect(getSidebarWidthStyle(true, false)).toEqual({
      '--layout-sidebar-width': 'var(--sidebar-width-icon)',
    });
    expect(getSidebarWidthStyle(true, true)).toEqual({
      '--layout-sidebar-width': '0px',
    });
  });
});
