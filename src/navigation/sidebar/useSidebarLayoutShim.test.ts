import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import { useSidebarLayoutShim } from './useSidebarLayoutShim';

const setLayout = vi.fn();
let mockLayoutConfig = { aside: { minimized: false } };
let mockSidebarState: 'expanded' | 'collapsed' = 'expanded';
let mockOpen = true;
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

vi.mock('@/metronic/layout/core', () => ({
  useLayout: () => ({
    config: mockLayoutConfig,
    setLayout,
  }),
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

describe('useSidebarLayoutShim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLayoutConfig = { aside: { minimized: false } };
    mockSidebarState = 'expanded';
    mockOpen = true;
    mockTheme = 'dark';
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
  });

  it('mirrors a collapsed sidebar state into the Metronic layout config', () => {
    mockSidebarState = 'collapsed';
    renderHook(() => useSidebarLayoutShim());

    expect(setLayout).toHaveBeenCalledWith({
      aside: { minimized: true },
    });
  });

  it('does not call setLayout when already in sync', () => {
    mockLayoutConfig = { aside: { minimized: false } };
    mockSidebarState = 'expanded';
    renderHook(() => useSidebarLayoutShim());

    expect(setLayout).not.toHaveBeenCalled();
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
});
