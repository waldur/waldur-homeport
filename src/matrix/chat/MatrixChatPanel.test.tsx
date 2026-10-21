import { render, screen } from '@testing-library/react';
import { FC, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setViewport } from 'waldur-ui';

const h = vi.hoisted(() => ({
  drawerMountCount: 0,
  matrixClient: {} as any,
  rooms: {} as any,
  call: {} as any,
  drawerExpanded: false,
}));

vi.mock('@/drawer/useDrawerExpanded', () => ({
  useDrawerExpanded: () => h.drawerExpanded,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => h.matrixClient,
}));

vi.mock('./useAllMatrixRooms', () => ({
  useAllMatrixRooms: () => h.rooms,
}));

vi.mock('./call/useMatrixCall', () => ({
  useMatrixCall: () => ({ callRoomUuid: null }),
}));

vi.mock('./MatrixRoomList', () => ({
  MatrixRoomList: () => <div data-testid="room-list" />,
}));

vi.mock('./MatrixChatDrawer', () => {
  const MatrixChatDrawer: FC = () => {
    useEffect(() => {
      h.drawerMountCount += 1;
    }, []);
    return <div data-testid="chat-drawer" />;
  };
  return { MatrixChatDrawer };
});

vi.mock('@/chat/chatDrawerPreferences', () => ({
  getChatDrawerPreference: (k: string) =>
    k === 'matrixCompactView' ? 'detail' : null,
  setChatDrawerPreference: vi.fn(),
  useChatDrawerPreference: () => [false, vi.fn()],
}));

import { MatrixChatPanel } from './MatrixChatPanel';

const ROOMS = [
  { uuid: 'room-1', state: 'active', room_name: 'chat5', room_alias: '#a:s' },
];

beforeEach(() => {
  h.drawerMountCount = 0;
  h.matrixClient = {
    connect: vi.fn(),
    connectionState: 'connected',
    userId: '@me:s',
    error: null,
  };
  h.rooms = { rooms: ROOMS, totalUnread: 0, isLoading: false };
  h.drawerExpanded = false;
});

describe('MatrixChatPanel — deep-link does not fight manual navigation', () => {
  it('does not re-connect to the deep-linked room after the user opens another room', () => {
    // Drawer opened deep-linked to room-A (e.g. a call's room). The user then
    // picks room-B from the list, so the live client's active room becomes
    // room-B. The panel must NOT yank the client back to room-A — that
    // catapults the user back into the call's room.
    h.matrixClient = {
      connect: vi.fn(),
      connectionState: 'connected',
      userId: '@me:s',
      activeRoomUuid: 'room-A',
      roomAccessDenied: false,
      error: null,
    };
    h.rooms = {
      rooms: [
        { uuid: 'room-A', state: 'active', room_name: 'A', room_alias: '#a:s' },
        { uuid: 'room-B', state: 'active', room_name: 'B', room_alias: '#b:s' },
      ],
      totalUnread: 0,
      isLoading: false,
    };

    const { rerender } = render(<MatrixChatPanel defaultRoomUuid="room-A" />);
    h.matrixClient.connect.mockClear();

    // User selected room-B → provider's active room is now room-B.
    h.matrixClient.activeRoomUuid = 'room-B';
    rerender(<MatrixChatPanel defaultRoomUuid="room-A" />);

    expect(h.matrixClient.connect).not.toHaveBeenCalledWith('room-A');
  });
});

describe('MatrixChatPanel — call stability across expand', () => {
  it('does not remount MatrixChatDrawer when the drawer expands or collapses', () => {
    const { rerender } = render(<MatrixChatPanel defaultRoomUuid="room-1" />);
    expect(h.drawerMountCount).toBe(1);

    h.drawerExpanded = true;
    rerender(<MatrixChatPanel defaultRoomUuid="room-1" />);
    expect(h.drawerMountCount).toBe(1);

    h.drawerExpanded = false;
    rerender(<MatrixChatPanel defaultRoomUuid="room-1" />);
    expect(h.drawerMountCount).toBe(1);
  });
});

describe('MatrixChatPanel — responsive dock layout', () => {
  it('does not dock sidebar on mobile even when drawer is expanded', () => {
    setViewport('mobile');
    h.drawerExpanded = true;

    render(<MatrixChatPanel defaultRoomUuid="room-1" />);
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('room-list').parentElement).toHaveClass('hidden');
  });

  it('docks sidebar on desktop when drawer is expanded', () => {
    setViewport('desktop');
    h.drawerExpanded = true;

    render(<MatrixChatPanel defaultRoomUuid="room-1" />);
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('room-list').parentElement).not.toHaveClass(
      'hidden',
    );
  });
});
