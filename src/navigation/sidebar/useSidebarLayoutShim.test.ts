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

vi.mock('waldur-ui', () => ({
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
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
  });

  it('applies the resolved sidebar style token on mount', () => {
    renderHook(() => useSidebarLayoutShim());

    expect(applySidebarStyle).toHaveBeenCalledWith('dark');
  });

  it('markUserToggled stops the resize-driven auto-minimize from firing', () => {
    const { result } = renderHook(() => useSidebarLayoutShim());
    result.current.markUserToggled();
    setOpen.mockClear();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1000,
    });
    window.dispatchEvent(new Event('resize'));

    expect(setOpen).not.toHaveBeenCalled();
  });

  it('auto-minimizes on resize to medium desktop width when open', () => {
    mockOpen = true;
    renderHook(() => useSidebarLayoutShim());
    setOpen.mockClear();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1000,
    });
    window.dispatchEvent(new Event('resize'));

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('auto-expands on resize to wide desktop width when collapsed', () => {
    mockOpen = false;
    mockSidebarState = 'collapsed';
    renderHook(() => useSidebarLayoutShim());
    setOpen.mockClear();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1500,
    });
    window.dispatchEvent(new Event('resize'));

    expect(setOpen).toHaveBeenCalledWith(true);
  });

  it('registers resize listener only once and does not re-register when open changes', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const { rerender } = renderHook(() => useSidebarLayoutShim());

    const initialResizeCalls = addEventListenerSpy.mock.calls.filter(
      ([event]) => event === 'resize',
    ).length;
    expect(initialResizeCalls).toBe(1);

    // Simulate sidebar open state changing
    mockOpen = false;
    mockSidebarState = 'collapsed';
    rerender();

    const afterRerenderCalls = addEventListenerSpy.mock.calls.filter(
      ([event]) => event === 'resize',
    ).length;
    expect(afterRerenderCalls).toBe(1);

    addEventListenerSpy.mockRestore();
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
