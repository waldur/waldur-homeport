import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

const h = vi.hoisted(() => ({
  callState: 'idle' as
    'idle' | 'discovering' | 'connecting' | 'connected' | 'error',
  callRoomId: null as string | null,
  callRoomUuid: null as string | null,
  matrixClient: {} as any,
  room: {} as any,
  rooms: [] as any[],
  memberNames: new Map<string, string>(),
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => h.matrixClient,
}));

vi.mock('./useMatrixRooms', () => ({
  useMatrixRooms: () => ({ data: h.rooms }),
}));

vi.mock('./useAllMatrixRooms', () => ({
  useAllMatrixRooms: () => ({ rooms: h.rooms }),
}));

vi.mock('./useMatrixRoom', () => ({
  useMatrixRoom: () => h.room,
}));

vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => h.memberNames,
}));

vi.mock('./call/useMatrixCall', () => ({
  useMatrixCall: () => ({
    callState: h.callState,
    callRoomId: h.callRoomId,
    callRoomUuid: h.callRoomUuid,
  }),
}));

vi.mock('./call/MatrixCallDockSlot', () => ({
  MatrixCallDockSlot: ({ roomId }: { roomId: string | null }) =>
    roomId ? <div data-testid="dock-slot" data-room-id={roomId} /> : null,
}));

vi.mock('./MatrixMessageList', () => ({
  MatrixMessageList: () => <div data-testid="message-list" />,
}));

vi.mock('./MatrixMessageInput', () => ({
  MatrixMessageInput: () => <div data-testid="message-input" />,
}));

vi.mock('./MatrixTypingIndicator', () => ({
  MatrixTypingIndicator: () => null,
}));

vi.mock('./MatrixSyncStatus', () => ({
  MatrixSyncStatus: () => null,
}));

vi.mock('./MatrixChatHeader', () => ({
  MatrixChatHeader: () => null,
}));

vi.mock('./MatrixRoomSelector', () => ({
  MatrixRoomSelector: () => null,
}));

vi.mock('./call/CallInProgressBanner', () => ({
  CallInProgressBanner: () => null,
}));

import { MatrixChatDrawer } from './MatrixChatDrawer';

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({ full_name: 'Test User' } as any);
  h.callState = 'idle';
  h.callRoomId = null;
  h.callRoomUuid = null;
  h.matrixClient = {
    connect: vi.fn(),
    connectionState: 'connected',
    userId: '@me:s',
    error: null,
    activeRoomId: '!room1:s',
  };
  h.room = {
    messages: [],
    typingUsers: [],
    markRoomRead: vi.fn(),
    loading: false,
    loadingOlder: false,
    hasOlderMessages: false,
    loadOlderMessages: vi.fn(),
  };
  h.rooms = [];
  h.memberNames = new Map();
});

describe('MatrixChatDrawer — dock slot + chat layout', () => {
  it('does not render the dock slot when no call is active', () => {
    render(<MatrixChatDrawer roomUuid="room-1" />);
    expect(screen.queryByTestId('dock-slot')).toBeNull();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('renders the dock slot when the call is connected in this room', () => {
    h.callState = 'connected';
    h.callRoomId = '!room1:s';
    h.callRoomUuid = 'room-1';
    render(<MatrixChatDrawer roomUuid="room-1" />);
    expect(screen.getByTestId('dock-slot')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('docks the error panel in this room instead of floating it', () => {
    h.callState = 'error';
    h.callRoomId = '!room1:s';
    h.callRoomUuid = 'room-1';
    render(<MatrixChatDrawer roomUuid="room-1" />);
    expect(screen.getByTestId('dock-slot')).toBeInTheDocument();
  });

  it('hides the chat-visibility toggle in the error state', () => {
    h.callState = 'error';
    h.callRoomId = '!room1:s';
    h.callRoomUuid = 'room-1';
    render(<MatrixChatDrawer roomUuid="room-1" />);
    expect(screen.getByTestId('dock-slot')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /hide chat|show chat/i }),
    ).toBeNull();
  });

  it('does not show the cross-room banner for a failed call elsewhere', () => {
    h.callState = 'error';
    h.callRoomId = '!other-room:s';
    h.callRoomUuid = 'other-room-uuid';
    render(<MatrixChatDrawer roomUuid="room-1" />);
    expect(
      screen.queryByRole('button', { name: /return to call/i }),
    ).toBeNull();
  });

  it('shows the cross-room banner instead of the dock slot when the call is in a different room', () => {
    h.callState = 'connected';
    h.callRoomId = '!other-room:s';
    h.callRoomUuid = 'other-room-uuid';
    render(<MatrixChatDrawer roomUuid="room-1" />);
    expect(screen.queryByTestId('dock-slot')).toBeNull();
    expect(
      screen.getByRole('button', { name: /return to call/i }),
    ).toBeInTheDocument();
  });

  it('toggling the chat-visibility button hides chat but keeps the dock slot', async () => {
    h.callState = 'connected';
    h.callRoomId = '!room1:s';
    h.callRoomUuid = 'room-1';
    const user = userEvent.setup();
    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.getByTestId('dock-slot')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide chat/i }));

    expect(screen.queryByTestId('message-list')).toBeNull();
    expect(screen.queryByTestId('message-input')).toBeNull();
    expect(screen.getByTestId('dock-slot')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show chat/i }));

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });
});

describe('MatrixChatDrawer — does not own the call view', () => {
  it('source does not import MatrixCallView (call lives in the host)', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync('src/matrix/chat/MatrixChatDrawer.tsx', 'utf8');
    expect(source).not.toMatch(/MatrixCallView/);
    expect(source).toMatch(/MatrixCallDockSlot/);
  });
});
