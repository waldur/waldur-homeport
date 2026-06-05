import { act, render, screen } from '@testing-library/react';
import { FC, PropsWithChildren, useContext, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  callState: 'idle' as string,
  callRoomId: null as string | null,
  observerCallbacks: [] as IntersectionObserverCallback[],
}));

vi.mock('./useMatrixCall', () => ({
  useMatrixCall: () => ({
    callState: h.callState,
    callRoomId: h.callRoomId,
  }),
}));

import { MatrixCallDockSlot } from './MatrixCallDockSlot';
import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { MatrixCallPortalProvider } from './MatrixCallPortalProvider';

const SetPipState: FC<{ value: boolean }> = ({ value }) => {
  const { setIsInDocumentPiP } = useContext(MatrixCallPortalContext);
  useEffect(() => {
    setIsInDocumentPiP(value);
  }, [setIsInDocumentPiP, value]);
  return null;
};

class MockIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    h.observerCallbacks.push(cb);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  root = null;
  rootMargin = '';
  thresholds = [];
}

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MatrixCallPortalProvider>{children}</MatrixCallPortalProvider>
);

const Probe: FC<{ onRead: (slot: any) => void }> = ({ onRead }) => {
  const ctx = useContext(MatrixCallPortalContext);
  onRead(ctx.registeredSlot);
  return null;
};

const fireVisibility = (isIntersecting: boolean) => {
  const entries = [{ isIntersecting } as IntersectionObserverEntry];
  h.observerCallbacks.forEach((cb) => cb(entries, {} as IntersectionObserver));
};

beforeEach(() => {
  h.callState = 'idle';
  h.callRoomId = null;
  h.observerCallbacks = [];
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
});

afterEach(() => {
  delete (globalThis as any).IntersectionObserver;
});

describe('MatrixCallDockSlot', () => {
  it('renders nothing when callState is idle', () => {
    const { container } = render(<MatrixCallDockSlot roomId="!abc:s" />, {
      wrapper,
    });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('[data-testid="dock-slot"]')).toBeNull();
  });

  it('renders nothing when roomId does not match callRoomId', () => {
    h.callState = 'connected';
    h.callRoomId = '!xyz:s';
    const { container } = render(<MatrixCallDockSlot roomId="!abc:s" />, {
      wrapper,
    });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('[data-testid="dock-slot"]')).toBeNull();
  });

  it('registers optimistically on mount and unregisters when the observer reports hidden', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    let slot: any = null;
    render(
      <>
        <MatrixCallDockSlot roomId="!abc:s" />
        <Probe onRead={(s) => (slot = s)} />
      </>,
      { wrapper },
    );
    expect(slot).not.toBeNull();
    expect(slot.roomId).toBe('!abc:s');

    act(() => fireVisibility(false));
    expect(slot).toBeNull();

    act(() => fireVisibility(true));
    expect(slot).not.toBeNull();
    expect(slot.roomId).toBe('!abc:s');
  });

  it('does not register when slot becomes visible but call is on a different room', () => {
    h.callState = 'connected';
    h.callRoomId = '!xyz:s';
    let slot: any = null;
    render(
      <>
        <MatrixCallDockSlot roomId="!abc:s" />
        <Probe onRead={(s) => (slot = s)} />
      </>,
      { wrapper },
    );
    act(() => fireVisibility(true));
    expect(slot).toBeNull();
  });

  it('unregisters when unmounted', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    let slot: any = 'unset';
    const { unmount } = render(
      <>
        <MatrixCallDockSlot roomId="!abc:s" />
        <Probe onRead={(s) => (slot = s)} />
      </>,
      { wrapper },
    );
    act(() => fireVisibility(true));
    expect(slot).not.toBeNull();
    unmount();
    let after: any = 'unset';
    render(<Probe onRead={(s) => (after = s)} />, { wrapper });
    expect(after).toBeNull();
  });

  it('re-registers under the new room when roomId prop changes', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    let lastSlot: any = null;
    const { rerender } = render(
      <>
        <MatrixCallDockSlot roomId="!abc:s" />
        <Probe onRead={(s) => (lastSlot = s)} />
      </>,
      { wrapper },
    );
    act(() => fireVisibility(true));
    expect(lastSlot.roomId).toBe('!abc:s');

    h.callRoomId = '!def:s';
    rerender(
      <>
        <MatrixCallDockSlot roomId="!def:s" />
        <Probe onRead={(s) => (lastSlot = s)} />
      </>,
    );
    act(() => fireVisibility(true));
    expect(lastSlot.roomId).toBe('!def:s');
  });

  it('renders a "Dock back" placeholder when the call is in document PiP', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    render(
      <>
        <SetPipState value={true} />
        <MatrixCallDockSlot roomId="!abc:s" />
      </>,
      { wrapper },
    );
    expect(screen.getByTestId('dock-slot-pip-placeholder')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /dock back/i }),
    ).toBeInTheDocument();
  });
});
