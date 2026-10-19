import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBootSplashDismiss } from './react';

const Gate = ({ ready }: { ready: boolean }) => {
  useBootSplashDismiss(ready);
  return null;
};

const splash = () => screen.queryByRole('status', { name: /^Starting/ });

describe('useBootSplashDismiss', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="boot-splash" role="status" aria-label="Starting Waldur"></div>';
  });
  afterEach(() => vi.useRealTimers());

  it('keeps the splash until ready', () => {
    render(<Gate ready={false} />);
    vi.advanceTimersByTime(5000);
    expect(splash()).not.toBeNull();
  });

  it('fades the splash out once ready', () => {
    const { rerender } = render(<Gate ready={false} />);
    rerender(<Gate ready />);
    expect(splash()).toHaveAttribute('data-leaving');
    vi.advanceTimersByTime(200);
    expect(splash()).toBeNull();
  });

  it('removes the splash if unmounted first', () => {
    const { unmount } = render(<Gate ready={false} />);
    unmount();
    vi.advanceTimersByTime(0);
    expect(splash()).toBeNull();
  });

  it("survives StrictMode's dev-only unmount and remount", () => {
    render(
      <StrictMode>
        <Gate ready={false} />
      </StrictMode>,
    );
    vi.advanceTimersByTime(1000);
    expect(splash()).not.toBeNull();
  });
});
