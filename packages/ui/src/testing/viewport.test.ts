import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getViewportState,
  resetViewport,
  setupVirtualViewport,
  setViewport,
  VIEWPORT_WIDTHS,
} from './viewport';

describe('viewport controller', () => {
  beforeEach(() => {
    setupVirtualViewport();
  });

  afterEach(() => {
    resetViewport();
  });

  it('defaults to desktop dimensions and hover capability', () => {
    const state = getViewportState();
    expect(state.width).toBe(1440);
    expect(state.height).toBe(960);
    expect(state.hover).toBe(true);

    expect(window.matchMedia('(min-width: 1200px)').matches).toBe(true);
    expect(window.matchMedia('(max-width: 991px)').matches).toBe(false);
    expect(window.matchMedia('(hover: none)').matches).toBe(false);
  });

  it('correctly adapts when setting named mobile viewport', () => {
    setViewport('mobile');
    expect(getViewportState().width).toBe(VIEWPORT_WIDTHS.mobile);

    expect(window.matchMedia('(max-width: 575px)').matches).toBe(true);
    expect(window.matchMedia('(max-width: 767px)').matches).toBe(true);
    expect(window.matchMedia('(min-width: 992px)').matches).toBe(false);
  });

  it('correctly adapts when setting specific pixel width', () => {
    setViewport(600); // Between sm (576) and md (768)
    expect(window.matchMedia('(min-width: 576px)').matches).toBe(true);
    expect(window.matchMedia('(max-width: 767px)').matches).toBe(true);
    expect(window.matchMedia('(min-width: 768px)').matches).toBe(false);
  });

  it('correctly evaluates compound between-queries', () => {
    setViewport('sm'); // 640px
    const query = '(min-width: 576px) and (max-width: 991px)';
    expect(window.matchMedia(query).matches).toBe(true);

    setViewport('xl'); // 1280px
    expect(window.matchMedia(query).matches).toBe(false);
  });

  it('correctly evaluates touch / no-hover', () => {
    setViewport({ hover: false });
    expect(window.matchMedia('(hover: none)').matches).toBe(true);
    expect(window.matchMedia('(hover: hover)').matches).toBe(false);

    setViewport({ hover: true });
    expect(window.matchMedia('(hover: none)').matches).toBe(false);
    expect(window.matchMedia('(hover: hover)').matches).toBe(true);
  });

  it('triggers change listeners when viewport changes', () => {
    setViewport('desktop');
    const mql = window.matchMedia('(max-width: 767px)');
    const listener = vi.fn();

    mql.addEventListener('change', listener);

    setViewport('sm'); // 640px <= 767px: flips from false to true
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ matches: true }),
    );

    // Setting same state does not re-trigger listener
    setViewport('xs'); // Still <= 767px
    expect(listener).toHaveBeenCalledTimes(1);

    // Growing back to desktop flips from true to false
    setViewport('desktop');
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ matches: false }),
    );
  });
});
