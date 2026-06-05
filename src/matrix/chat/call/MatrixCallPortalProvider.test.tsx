import { act, renderHook } from '@testing-library/react';
import { FC, PropsWithChildren, useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { MatrixCallPortalProvider } from './MatrixCallPortalProvider';

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MatrixCallPortalProvider>{children}</MatrixCallPortalProvider>
);

const useCtx = () => useContext(MatrixCallPortalContext);

beforeEach(() => {
  sessionStorage.clear();
});

describe('MatrixCallPortalProvider', () => {
  it('starts with no registered slot', () => {
    const { result } = renderHook(useCtx, { wrapper });
    expect(result.current.registeredSlot).toBeNull();
  });

  it('registers and unregisters a slot by roomId', () => {
    const el = document.createElement('div');
    const { result } = renderHook(useCtx, { wrapper });
    act(() => result.current.registerSlot('!abc:s', el));
    expect(result.current.registeredSlot).toEqual({ roomId: '!abc:s', el });
    act(() => result.current.unregisterSlot('!abc:s'));
    expect(result.current.registeredSlot).toBeNull();
  });

  it('unregisterSlot is a no-op when the roomId does not match', () => {
    const el = document.createElement('div');
    const { result } = renderHook(useCtx, { wrapper });
    act(() => result.current.registerSlot('!abc:s', el));
    act(() => result.current.unregisterSlot('!other:s'));
    expect(result.current.registeredSlot).toEqual({ roomId: '!abc:s', el });
  });

  it('persists widget position to sessionStorage', () => {
    const { result } = renderHook(useCtx, { wrapper });
    act(() => result.current.setWidgetPosition({ x: 100, y: 200 }));
    expect(sessionStorage.getItem('waldur_matrix_call_widget_pos')).toBe(
      JSON.stringify({ x: 100, y: 200 }),
    );
  });

  it('hydrates widget position from sessionStorage', () => {
    sessionStorage.setItem(
      'waldur_matrix_call_widget_pos',
      JSON.stringify({ x: 50, y: 60 }),
    );
    const { result } = renderHook(useCtx, { wrapper });
    expect(result.current.widgetPosition).toEqual({ x: 50, y: 60 });
  });

  it('fires registered onReturnToCall callbacks on requestReturnToCall', () => {
    const cb = vi.fn();
    const { result } = renderHook(useCtx, { wrapper });
    let unsub: () => void = () => {};
    act(() => {
      unsub = result.current.onReturnToCall(cb);
    });
    act(() => result.current.requestReturnToCall());
    expect(cb).toHaveBeenCalledTimes(1);
    act(() => unsub());
    act(() => result.current.requestReturnToCall());
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
