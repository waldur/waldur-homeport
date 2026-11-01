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
  cancelRecording: vi.fn(),
  registerRoomView: vi.fn(),
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => h.matrixClient,
}));

vi.mock('./useAllMatrixRooms', () => ({
  useAllMatrixRooms: () => ({ rooms: h.rooms }),
}));

vi.mock('./useMatrixRoom', () => ({
  useMatrixRoom: () => h.room,
}));

vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => h.memberNames,
  useRoomMemberImages: () => new Map(),
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
  MatrixMessageList: ({ loading }: { loading: boolean }) => (
    <div data-testid="message-list" data-loading={String(loading)} />
  ),
}));

vi.mock('./MatrixMessageInput', () => ({
  MatrixMessageInput: () => <div data-testid="message-input" />,
}));

vi.mock('./MatrixTypingIndicator', () => ({
  MatrixTypingIndicator: () => <div data-testid="typing-indicator" />,
}));

vi.mock('./MatrixSyncStatus', () => ({
  MatrixSyncStatus: () => null,
}));

vi.mock('./MatrixChatHeader', () => ({
  MatrixChatHeader: () => null,
}));

vi.mock('./voice/useVoiceRecorder', () => ({
  useVoiceRecorder: () => ({
    state: 'recording',
    elapsedMs: 0,
    supported: true,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(null),
    cancel: h.cancelRecording,
  }),
}));

vi.mock('./call/CallInProgressBanner', () => ({
  CallInProgressBanner: () => <div data-testid="call-banner" />,
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
    activeRoomUuid: 'room-1',
    registerRoomView: h.registerRoomView,
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
  h.cancelRecording.mockClear();
  h.registerRoomView.mockReset();
});

describe('MatrixChatDrawer — the room on screen', () => {
  it('registers as a view on the room and unregisters on unmount', () => {
    const unregister = vi.fn();
    h.registerRoomView.mockReturnValue(unregister);

    const { unmount } = render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(h.registerRoomView).toHaveBeenCalledWith('room-1');
    unmount();
    expect(unregister).toHaveBeenCalled();
  });

  it('shows a retry when the switch to this room failed', () => {
    h.matrixClient.activeRoomUuid = 'other-room';
    h.matrixClient.failedRoomUuid = 'room-1';
    h.matrixClient.error = 'Could not open the conversation.';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(
      screen.getByText('Could not open the conversation.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('message-list')).not.toBeInTheDocument();
  });

  it('offers no join for a call in another room', () => {
    h.matrixClient.activeRoomUuid = 'other-room';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.queryByTestId('call-banner')).not.toBeInTheDocument();
  });

  it('shows no retry over a room that opened after all', () => {
    h.matrixClient.failedRoomUuid = 'room-1';
    h.matrixClient.error = 'Could not open the conversation.';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('shows no retry for an error about something else', () => {
    h.matrixClient.activeRoomUuid = 'other-room';
    h.matrixClient.failedRoomUuid = 'other-room';
    h.matrixClient.error = 'Connection lost, reconnecting...';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('docks no call while another room is the active one', () => {
    h.matrixClient.activeRoomUuid = 'other-room';
    h.callState = 'connected';
    h.callRoomId = '!room1:s';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.queryByTestId('dock-slot')).not.toBeInTheDocument();
  });

  it('shows no typing from another room', () => {
    h.matrixClient.activeRoomUuid = 'other-room';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it("loads rather than show another room's messages", () => {
    h.matrixClient.activeRoomUuid = 'other-room';

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(screen.getByTestId('message-list')).toHaveAttribute(
      'data-loading',
      'true',
    );
  });
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

  // A project has exactly one room; switching conversations belongs to the
  // room list, which remounts the drawer.
  it('offers no room switcher even when several rooms are active', () => {
    h.rooms = [
      { uuid: 'room-1', state: 'active', room_alias: '#a:s', room_name: 'A' },
      { uuid: 'room-2', state: 'active', room_alias: '#b:s', room_name: 'B' },
    ];
    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(
      screen.queryByRole('combobox', { name: 'Select chat room' }),
    ).toBeNull();
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

describe('MatrixChatDrawer — ended session', () => {
  it('says the session has ended and reconnects on reload', async () => {
    h.matrixClient = {
      ...h.matrixClient,
      connectionState: 'ended',
      activeRoomId: null,
    };

    render(<MatrixChatDrawer roomUuid="room-1" />);

    expect(
      screen.getByText('Your chat session has ended.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('message-input')).toBeNull();
    // Mounting the drawer connects too; only the click should count here.
    h.matrixClient.connect.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(h.matrixClient.connect).toHaveBeenCalledWith('room-1');
  });
});
