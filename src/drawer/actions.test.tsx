import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDrawer, useIsDrawerOpenWith } from './actions';
import { DrawerProvider } from './DrawerContext';
import { DRAWER_SHELL_CLASS } from './shellClasses';

const Body = () => null;

const renderDrawerState = () =>
  renderHook(
    () => ({
      drawer: useDrawer(),
      ai: useIsDrawerOpenWith(DRAWER_SHELL_CLASS.ai),
      support: useIsDrawerOpenWith(DRAWER_SHELL_CLASS.support),
    }),
    { wrapper: DrawerProvider },
  );

describe('useIsDrawerOpenWith', () => {
  it('is true only for the drawer that is showing', () => {
    const { result } = renderDrawerState();

    act(() =>
      result.current.drawer.openDrawer(Body, {
        shellClass: DRAWER_SHELL_CLASS.ai,
      }),
    );

    expect(result.current.ai).toBe(true);
    expect(result.current.support).toBe(false);
  });

  // closeDrawer keeps the shell class for the slide-out, so the shell class
  // alone would leave the toggle looking pressed after the drawer is gone.
  it('turns false as soon as the drawer closes', () => {
    const { result } = renderDrawerState();
    act(() =>
      result.current.drawer.openDrawer(Body, {
        shellClass: DRAWER_SHELL_CLASS.ai,
      }),
    );

    act(() => result.current.drawer.closeDrawer());

    expect(result.current.ai).toBe(false);
  });
});
