import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

import { BootSplashGate } from './BootSplashGate';

const splash = () => screen.queryByRole('status', { name: /^Starting/ });

const firstPageReady = async () => {
  act(() =>
    vi
      .mocked(router.transitionService.onSuccess)
      .mock.calls.at(-1)[1]({} as any),
  );
  await act(() => vi.advanceTimersByTimeAsync(100));
};

describe('BootSplashGate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="boot-splash" role="status" aria-label="Starting Waldur"></div>';
  });
  afterEach(() => vi.useRealTimers());

  it('keeps the splash until the first page is ready', async () => {
    render(<BootSplashGate />);
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(splash()).not.toBeNull();
    expect(splash()).not.toHaveAttribute('data-leaving');
  });

  it('fades the splash out, then removes it', async () => {
    render(<BootSplashGate />);
    await firstPageReady();
    expect(splash()).toHaveAttribute('data-leaving');

    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(splash()).toBeNull();
  });

  it('removes the splash at once if the application unmounts first', () => {
    const { unmount } = render(<BootSplashGate />);
    unmount();
    expect(splash()).toBeNull();
  });
});
