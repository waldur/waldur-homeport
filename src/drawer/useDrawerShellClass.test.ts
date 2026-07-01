import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDrawerShellClass } from './useDrawerShellClass';

const getDrawer = () =>
  // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
  document.getElementById('kt_drawer')!;

beforeEach(() => {
  vi.useFakeTimers();
  const drawer = document.createElement('div');
  drawer.id = 'kt_drawer';
  document.body.appendChild(drawer);
});

afterEach(() => {
  vi.useRealTimers();
  // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
  document.getElementById('kt_drawer')?.remove();
});

describe('useDrawerShellClass', () => {
  it('adds the class on mount', () => {
    getDrawer().classList.add('drawer-on');
    renderHook(() => useDrawerShellClass('support-drawer-active'));
    expect(getDrawer().classList.contains('support-drawer-active')).toBe(true);
  });

  it('removes the class immediately on unmount while the drawer stays open', () => {
    getDrawer().classList.add('drawer-on');
    const { unmount } = renderHook(() =>
      useDrawerShellClass('support-drawer-active'),
    );
    unmount();
    expect(getDrawer().classList.contains('support-drawer-active')).toBe(false);
  });

  it('delays class removal while the drawer slides out', () => {
    getDrawer().classList.add('drawer-on');
    const { unmount } = renderHook(() =>
      useDrawerShellClass('support-drawer-active'),
    );
    // Drawer is closing: drawer-on cleared before the component unmounts.
    getDrawer().classList.remove('drawer-on');
    unmount();
    expect(getDrawer().classList.contains('support-drawer-active')).toBe(true);
    vi.advanceTimersByTime(350);
    expect(getDrawer().classList.contains('support-drawer-active')).toBe(false);
  });

  it('cancels a pending removal when the same drawer is reopened mid-animation', () => {
    // Open, then close (slide-out) the drawer.
    getDrawer().classList.add('drawer-on');
    const first = renderHook(() =>
      useDrawerShellClass('support-drawer-active'),
    );
    getDrawer().classList.remove('drawer-on');
    first.unmount(); // schedules removal in 350ms

    // Reopen the same drawer before the slide-out timer fires.
    getDrawer().classList.add('drawer-on');
    renderHook(() => useDrawerShellClass('support-drawer-active'));

    // The stale timer must NOT strip the shell class off the now-open drawer,
    // otherwise the Metronic overlay becomes visible again.
    vi.advanceTimersByTime(350);
    expect(getDrawer().classList.contains('support-drawer-active')).toBe(true);
  });
});
