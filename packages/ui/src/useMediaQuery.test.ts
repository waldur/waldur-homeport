import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BREAKPOINTS,
  useBreakpointBetween,
  useBreakpointDown,
  useBreakpointUp,
  useMediaQuery,
  useNoHover,
} from './useMediaQuery';

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when media query matches', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('updates when media query status changes', () => {
    let changeHandler: (() => void) | null = null;
    let currentMatches = false;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return currentMatches;
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(hover: none)'));
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      changeHandler?.();
    });

    expect(result.current).toBe(true);
  });

  it('removes listener on unmount', () => {
    const removeEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 992px)'));
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('returns serverFallback when matchMedia is unavailable', () => {
    // @ts-expect-error simulating environment without matchMedia
    delete window.matchMedia;

    const { result: fallbackTrue } = renderHook(() =>
      useMediaQuery('(max-width: 576px)', true),
    );
    expect(fallbackTrue.current).toBe(true);

    const { result: fallbackFalse } = renderHook(() =>
      useMediaQuery('(max-width: 576px)', false),
    );
    expect(fallbackFalse.current).toBe(false);
  });
});

describe('Breakpoint Helpers', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('useBreakpointDown queries strictly below breakpoint with boundary safety', () => {
    const queries: string[] = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      queries.push(query);
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    renderHook(() => useBreakpointDown('md'));
    expect(queries).toContain(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    expect(queries).toContain('(max-width: 767px)');

    renderHook(() => useBreakpointDown(1200));
    expect(queries).toContain('(max-width: 1199px)');
  });

  it('useBreakpointUp queries at or above breakpoint', () => {
    const queries: string[] = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      queries.push(query);
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    renderHook(() => useBreakpointUp('lg'));
    expect(queries).toContain(`(min-width: ${BREAKPOINTS.lg}px)`);
    expect(queries).toContain('(min-width: 992px)');

    renderHook(() => useBreakpointUp(1400));
    expect(queries).toContain('(min-width: 1400px)');
  });

  it('useBreakpointBetween queries between min and max range safely', () => {
    const queries: string[] = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      queries.push(query);
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    renderHook(() => useBreakpointBetween('sm', 'lg'));
    expect(queries).toContain('(min-width: 576px) and (max-width: 991px)');
  });

  it('useNoHover queries (hover: none)', () => {
    const queries: string[] = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      queries.push(query);
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    renderHook(() => useNoHover());
    expect(queries).toContain('(hover: none)');
  });
});
