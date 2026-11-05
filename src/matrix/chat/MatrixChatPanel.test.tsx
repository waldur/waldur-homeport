import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setViewport } from 'waldur-ui';

const h = vi.hoisted(() => ({
  drawerMountCount: 0,
  matrixClient: {} as any,
  rooms: {} as any,
  call: {} as any,
  drawerExpanded: false,
  lastRoomUuid: null as string | null,
  roomOptions: {} as object,
}));

vi.mock('@/drawer/useDrawerExpanded', () => ({
  useDrawerExpanded: () => h.drawerExpanded,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => h.matrixClient,
}));

vi.mock('./useAllMatrixRooms', () => ({
  useAllMatrixRooms: (options: object) => {
    h.roomOptions = options;
    return h.rooms;
  },
}));

vi.mock('./call/useMatrixCall', () => ({
  useMatrixCall: () => ({ callRoomUuid: null }),
}));

vi.mock('./MatrixRoomList', () => ({
  MatrixRoomList: ({ onSelect }: { onSelect(uuid: string): void }) => (
    <div data-testid="room-list">
      <button onClick={() => onSelect('room-B')}>Pick room-B</button>
    </div>
  ),
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
    k === 'matrixCompactView'
      ? 'detail'
      : k === 'lastRoomUuid'
        ? h.lastRoomUuid
        : null,
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
    deniedRoomUuids: new Set(),
    connectionState: 'connected',
    userId: '@me:s',
    error: null,
  };
  h.rooms = { rooms: ROOMS, totalUnread: 0, isLoading: false };
  h.drawerExpanded = false;
  h.lastRoomUuid = null;
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
      deniedRoomUuids: new Set(),
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

  // The header shows the picked room and messages go to the active one, so
  // connecting the deep link here would send them to the wrong room.
  it('does not open the deep-linked room over one picked while connecting', async () => {
    h.matrixClient = {
      connect: vi.fn(),
      deniedRoomUuids: new Set(),
      connectionState: 'connecting',
      activeRoomUuid: null,
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

    await userEvent.click(screen.getByText('Pick room-B'));
    h.matrixClient.connectionState = 'connected';
    rerender(<MatrixChatPanel defaultRoomUuid="room-A" />);

    expect(h.matrixClient.connect).toHaveBeenCalledWith('room-B');
    expect(h.matrixClient.connect).not.toHaveBeenCalledWith('room-A');
  });

  it('opens the deep-linked room once connected when nothing was picked', () => {
    h.matrixClient = {
      connect: vi.fn(),
      deniedRoomUuids: new Set(),
      connectionState: 'connecting',
      activeRoomUuid: null,
      error: null,
    };
    const { rerender } = render(<MatrixChatPanel defaultRoomUuid="room-1" />);

    h.matrixClient.connectionState = 'connected';
    rerender(<MatrixChatPanel defaultRoomUuid="room-1" />);

    expect(h.matrixClient.connect).toHaveBeenCalledWith('room-1');
  });
});

describe('MatrixChatPanel — a room missing from the list', () => {
  const renderShowingRoom = (props: object, rooms: object) => {
    h.rooms = { rooms: [], totalUnread: 0, isLoading: false, ...rooms };
    render(<MatrixChatPanel {...props} />);
  };

  it('asks for the sender names its previews show', () => {
    renderShowingRoom({}, {});
    expect(h.roomOptions).toEqual({ resolveSenders: true });
  });

  it('keeps a deep-linked room the list does not hold', () => {
    renderShowingRoom({ defaultRoomUuid: 'room-1' }, {});
    expect(screen.getByTestId('chat-drawer')).toBeInTheDocument();
  });

  it('keeps a remembered room when the list failed to load', () => {
    h.lastRoomUuid = 'room-1';
    renderShowingRoom({}, { error: new Error('Server error') });
    expect(screen.getByTestId('chat-drawer')).toBeInTheDocument();
  });

  it('drops a remembered room the loaded list does not hold', () => {
    h.lastRoomUuid = 'room-1';
    renderShowingRoom({}, {});
    expect(screen.queryByTestId('chat-drawer')).not.toBeInTheDocument();
  });
});

describe('MatrixChatPanel — a refused room', () => {
  const renderWithDenied = (deniedRoomUuid: string) => {
    h.matrixClient = {
      connect: vi.fn(),
      connectionState: 'connected',
      activeRoomUuid: 'room-A',
      deniedRoomUuids: new Set([deniedRoomUuid]),
      error: null,
    };
    h.rooms = {
      rooms: [{ uuid: 'room-A', state: 'active', room_name: 'A' }],
      totalUnread: 0,
      isLoading: false,
    };
    render(<MatrixChatPanel defaultRoomUuid="room-A" />);
  };

  it('says so for the room on screen', () => {
    renderWithDenied('room-A');
    expect(
      screen.getByText('You are not a member of this conversation'),
    ).toBeInTheDocument();
  });

  it('keeps showing a room when another one was refused', () => {
    renderWithDenied('room-B');
    expect(screen.getByTestId('chat-drawer')).toBeInTheDocument();
  });
});

describe('MatrixChatPanel — a room open in another view', () => {
  // The conversation says the room is elsewhere and brings it back here; the
  // panel must not swap it for a placeholder without that way back.
  it('keeps the conversation on screen', () => {
    h.matrixClient = {
      connect: vi.fn(),
      connectionState: 'connected',
      activeRoomUuid: 'room-B',
      requestedRoomUuid: 'room-B',
      deniedRoomUuids: new Set(),
      error: null,
    };
    h.rooms = {
      rooms: [{ uuid: 'room-A', state: 'active', room_name: 'A' }],
      totalUnread: 0,
      isLoading: false,
    };

    render(<MatrixChatPanel defaultRoomUuid="room-A" hideRoomList />);

    expect(screen.getByTestId('chat-drawer')).toBeInTheDocument();
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
