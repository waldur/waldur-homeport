import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useResolvedVar } from './react';

const root = document.documentElement;

afterEach(() => {
  root.removeAttribute('style');
  root.removeAttribute('data-theme');
});

describe('useResolvedVar', () => {
  it('reads the current value', () => {
    root.style.setProperty('--test-colour', '#307300');
    const { result } = renderHook(() => useResolvedVar('--test-colour'));
    expect(result.current).toBe('#307300');
  });

  it('picks up a value written after the first render, as the brand ramp is', async () => {
    const { result } = renderHook(() => useResolvedVar('--test-late'));
    expect(result.current).toBe('');
    act(() => {
      root.style.setProperty('--test-late', '#1570ef');
    });
    await waitFor(() => expect(result.current).toBe('#1570ef'));
  });

  it('re-reads when data-theme changes', async () => {
    root.style.setProperty('--test-colour', '#307300');
    const { result } = renderHook(() => useResolvedVar('--test-colour'));
    act(() => {
      root.style.setProperty('--test-colour', '#97bf89');
      root.setAttribute('data-theme', 'dark');
    });
    await waitFor(() => expect(result.current).toBe('#97bf89'));
  });

  it('stops observing on unmount', () => {
    const { unmount } = renderHook(() => useResolvedVar('--test-colour'));
    expect(() => {
      unmount();
      root.style.setProperty('--test-colour', '#000000');
    }).not.toThrow();
  });
});
