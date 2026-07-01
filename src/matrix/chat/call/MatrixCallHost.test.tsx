import { render, screen } from '@testing-library/react';
import { FC, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));

vi.mock('@/support/openSupportDrawer', () => ({
  openSupportDrawer: vi.fn(),
}));

const h = vi.hoisted(() => ({
  callState: 'idle' as string,
  callRoomId: null as string | null,
  callRoomUuid: null as string | null,
  rooms: [] as any[],
  callViewMountCount: 0,
}));

vi.mock('./useMatrixCall', () => ({
  useMatrixCall: () => ({
    callState: h.callState,
    callRoomId: h.callRoomId,
    callRoomUuid: h.callRoomUuid,
    credentials: null,
    callMembers: [],
    rtcAvailable: true,
    error: null,
    startCall: vi.fn(),
    endCall: vi.fn(),
    markConnected: vi.fn(),
  }),
}));

vi.mock('../useAllMatrixRooms', () => ({
  useAllMatrixRooms: () => ({
    rooms: h.rooms,
    totalUnread: 0,
    isLoading: false,
  }),
}));

vi.mock('./MatrixCallView', () => {
  const MockCallView: FC = () => {
    // useState initializer runs exactly once per mount — count via that
    // instead of useEffect to keep the mock dependency-free.
    useState(() => {
      h.callViewMountCount += 1;
      return 0;
    });
    return <div data-testid="call-view" />;
  };
  return { __esModule: true, default: MockCallView };
});

import { MatrixCallHost } from './MatrixCallHost';
import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { MatrixCallPortalProvider } from './MatrixCallPortalProvider';

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MatrixCallPortalProvider>{children}</MatrixCallPortalProvider>
);

const RegisterSlot: FC<{ roomId: string }> = ({ roomId }) => {
  const { registerSlot, unregisterSlot } = useContext(MatrixCallPortalContext);
  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-testid', 'external-slot');
    document.body.appendChild(el);
    registerSlot(roomId, el);
    return () => {
      unregisterSlot(roomId);
      el.remove();
    };
  }, [registerSlot, unregisterSlot, roomId]);
  return null;
};

beforeEach(() => {
  h.callState = 'idle';
  h.callRoomId = null;
  h.callRoomUuid = null;
  h.callViewMountCount = 0;
  h.rooms = [
    {
      uuid: 'uuid-1',
      state: 'active',
      room_name: 'Project Alpha',
      room_id: '!abc:s',
    },
  ];
});

afterEach(() => {
  // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
  const slots = document.querySelectorAll('[data-testid="external-slot"]');
  slots.forEach((el) => el.remove());
});

describe('MatrixCallHost', () => {
  it('renders nothing when callState is idle', () => {
    render(<MatrixCallHost />, { wrapper });
    expect(screen.queryByTestId('call-view')).toBeNull();
  });

  it('portals MatrixCallView into the registered slot when its roomId matches callRoomId', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    h.callRoomUuid = 'uuid-1';
    render(
      <>
        <RegisterSlot roomId="!abc:s" />
        <MatrixCallHost />
      </>,
      { wrapper },
    );
    const slot = screen.getByTestId('external-slot');
    // eslint-disable-next-line testing-library/no-node-access
    expect(slot.querySelector('[data-testid="call-view"]')).not.toBeNull();
    // Widget chrome should NOT be visible when slot matches.
    expect(screen.queryByText('Project Alpha')).toBeNull();
  });

  it('portals MatrixCallView into the floating widget when no slot matches', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    h.callRoomUuid = 'uuid-1';
    render(<MatrixCallHost />, { wrapper });
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    const target = screen.getByTestId('call-widget-portal-target');
    // eslint-disable-next-line testing-library/no-node-access
    expect(target.querySelector('[data-testid="call-view"]')).not.toBeNull();
  });

  it('keeps MatrixCallView mounted across target switches', () => {
    h.callState = 'connected';
    h.callRoomId = '!abc:s';
    h.callRoomUuid = 'uuid-1';
    // Keep MatrixCallHost at position 0 of the fragment across rerenders so
    // React reconciles it in place instead of unmounting.
    const Harness: FC<{ withSlot: boolean }> = ({ withSlot }) => (
      <>
        <MatrixCallHost />
        {withSlot && <RegisterSlot roomId="!abc:s" />}
      </>
    );
    const { rerender } = render(<Harness withSlot={false} />, { wrapper });
    expect(h.callViewMountCount).toBe(1);
    rerender(<Harness withSlot={true} />);
    expect(h.callViewMountCount).toBe(1);
  });
});
