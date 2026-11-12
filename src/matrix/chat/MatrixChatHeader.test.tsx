import { EventEmitter } from 'events';

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { MatrixCredentialsDialog } from '@/matrix/MatrixJoinButton';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { MatrixChatHeader } from './MatrixChatHeader';

const h = vi.hoisted(() => ({
  members: [] as any[],
  call: {} as any,
  matrixClient: {} as any,
  getRoomNotificationLevel: vi.fn(),
  setRoomNotificationLevel: vi.fn(),
  commands: [] as any[],
  pickCommand: vi.fn(),
}));

vi.mock('./commands/useComposerCommands', () => ({
  useComposerCommands: () => ({ commands: h.commands }),
}));

vi.mock('./MatrixMessageActionsContext', () => ({
  useMatrixMessageActions: () => ({ pickCommand: h.pickCommand }),
}));

const encryptSupport = vi.hoisted(() => ({ supported: true }));
vi.mock('./call/callEncryption', () => ({
  canEncryptCallMedia: () => encryptSupport.supported,
}));

vi.mock('./useRoomMembers', () => ({
  useRoomMembers: () => h.members,
}));

vi.mock('./call/useMatrixCall', () => ({
  useMatrixCall: () => h.call,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => h.matrixClient,
}));

vi.mock('./useMemberMatrixRooms', () => ({
  useMemberMatrixRooms: () => ({ data: [] }),
}));

vi.mock('./notificationLevel', () => ({
  getRoomNotificationLevel: (...a: any[]) => h.getRoomNotificationLevel(...a),
  setRoomNotificationLevel: (...a: any[]) => h.setRoomNotificationLevel(...a),
}));

const MEMBERS = [
  { userId: '@mart:s', name: 'Mart Tamm', membership: 'join', powerLevel: 0 },
  {
    userId: '@lea:s',
    name: 'Lea Eichenbaum',
    membership: 'join',
    powerLevel: 0,
  },
];

// The icon-only kebab, by its accessible name.
const actionsToggle = (container: HTMLElement) =>
  within(container).getByRole('button', { name: 'Actions' });

const renderHeader = (props: Record<string, unknown> = {}) =>
  render(
    <MatrixChatHeader
      roomUuid="room-1"
      roomName="LLM Training Pipeline"
      {...props}
    />,
  );

beforeEach(() => {
  ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = 'password';
  vi.mocked(useNotify().showSuccess).mockClear();
  vi.mocked(useNotify().showError).mockClear();
  vi.mocked(useModal().openDialog).mockClear();
  h.members = MEMBERS;
  h.commands = [];
  encryptSupport.supported = true;
  h.call = {
    callState: 'idle',
    rtcAvailable: false,
    callMembers: [],
    callRoomUuid: null,
    credentials: null,
    error: null,
    startCall: vi.fn(),
    endCall: vi.fn(),
  };
  h.matrixClient = {
    client: null,
    activeRoomId: null,
    activeRoomUuid: 'room-1',
  };
  h.getRoomNotificationLevel = vi.fn().mockReturnValue('mentions');
  h.setRoomNotificationLevel = vi.fn().mockResolvedValue(undefined);
});

describe('MatrixChatHeader', () => {
  it('renders the room name', () => {
    renderHeader();
    expect(screen.getByText('LLM Training Pipeline')).toBeTruthy();
  });

  it('shows a members button when the room has members', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /members/i })).toBeTruthy();
  });

  it('hides the members button when the room has no members', () => {
    h.members = [];
    renderHeader();
    expect(screen.queryByRole('button', { name: /members/i })).toBeNull();
  });

  it('shows no member count of another room that is open', () => {
    h.matrixClient.activeRoomUuid = 'other-room';
    renderHeader();
    expect(screen.queryByRole('button', { name: /members/i })).toBeNull();
  });

  it('opens the members popover with member names on click', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /members/i }));
    expect(await screen.findByText('Mart Tamm')).toBeTruthy();
    expect(screen.getByText('Lea Eichenbaum')).toBeTruthy();
  });

  it('lists call and external-client actions in the kebab menu', async () => {
    const user = userEvent.setup();
    h.call.rtcAvailable = true;
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    await user.click(actionsToggle(container));
    expect(await screen.findByText('Start call')).toBeTruthy();
    expect(screen.getByText(/external Matrix client/i)).toBeTruthy();
  });

  it('shows the Matrix login before handing the room to an external client', async () => {
    const user = userEvent.setup();
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    await user.click(actionsToggle(container));
    await user.click(await screen.findByText(/external Matrix client/i));
    expect(useModal().openDialog).toHaveBeenCalledWith(
      MatrixCredentialsDialog,
      {
        resolve: { roomAlias: '#llm:server' },
        size: 'lg',
      },
    );
  });

  it('offers no external client when users cannot sign in to one', async () => {
    const user = userEvent.setup();
    h.call.rtcAvailable = true;
    ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = 'none';
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    await user.click(actionsToggle(container));
    expect(await screen.findByText('Start call')).toBeTruthy();
    expect(screen.queryByText(/external Matrix client/i)).toBeNull();
  });

  it('shows "End call" in the kebab when the active call is in this room', async () => {
    const user = userEvent.setup();
    h.call.rtcAvailable = true;
    h.call.callState = 'connected';
    h.call.callRoomUuid = 'room-1';
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    await user.click(actionsToggle(container));
    expect(await screen.findByText('End call')).toBeTruthy();
  });

  it('shows a disabled "Start call" when the active call is in a different room', async () => {
    const user = userEvent.setup();
    h.call.rtcAvailable = true;
    h.call.callState = 'connected';
    h.call.callRoomUuid = 'some-other-room';
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    await user.click(actionsToggle(container));
    const item = await screen.findByText('Start call');
    expect(item).toBeTruthy();
    // Radix marks a disabled row with aria-disabled/data-disabled rather
    // than a visual class — real semantics assistive tech can
    // read, where the previous markup only looked disabled.
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('[role="menuitem"]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('disables "Start call" with the reason when the browser cannot encrypt the room’s call', async () => {
    const user = userEvent.setup();
    encryptSupport.supported = false;
    h.call.rtcAvailable = true;
    h.matrixClient = {
      client: {
        getRoom: () => ({ hasEncryptionStateEvent: () => true }),
        on: vi.fn(),
        removeListener: vi.fn(),
      },
      activeRoomId: '!r:s',
      activeRoomUuid: 'room-1',
    };
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    const item = await screen.findByText('Start call');
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('[role="menuitem"]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.hover(item);
    expect(
      await screen.findByRole('tooltip', {
        name: "This browser can't take part in encrypted calls.",
      }),
    ).toBeInTheDocument();
  });

  it('hides "Chat commands" when the room offers no commands', async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    expect(await screen.findByText('Notifications')).toBeTruthy();
    expect(screen.queryByText('Chat commands')).toBeNull();
  });

  it('disables "Chat commands" when none is available', async () => {
    const user = userEvent.setup();
    h.commands = [
      { name: 'ticket', source: 'bot', available: false, reason: 'No.' },
      { name: 'call', source: 'client', available: false, reason: 'Busy.' },
    ];
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    const item = await screen.findByText('Chat commands');
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('[role="menuitem"]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.hover(item);
    expect(
      await screen.findByRole('tooltip', {
        name: 'No commands are available in this room.',
      }),
    ).toBeInTheDocument();
  });

  it('gives the reason when every command is unavailable for the same one', async () => {
    const user = userEvent.setup();
    const reason = 'The chat bot is not running.';
    h.commands = [
      { name: 'help', source: 'bot', available: false, reason },
      { name: 'ticket', source: 'bot', available: false, reason },
    ];
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    await user.hover(await screen.findByText('Chat commands'));
    expect(
      await screen.findByRole('tooltip', { name: reason }),
    ).toBeInTheDocument();
  });

  it('offers no commands of another room that is open', async () => {
    const user = userEvent.setup();
    h.commands = [{ name: 'status', source: 'bot', available: true }];
    h.matrixClient.activeRoomUuid = 'other-room';
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    const item = await screen.findByText('Chat commands');
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('[role="menuitem"]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.hover(item);
    expect(
      await screen.findByRole('tooltip', {
        name: 'The conversation is not open yet.',
      }),
    ).toBeInTheDocument();
  });

  it('opens the commands dialog, which puts a picked command in the composer', async () => {
    const user = userEvent.setup();
    h.commands = [{ name: 'status', source: 'bot', available: true }];
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    await user.click(await screen.findByText('Chat commands'));
    const [, options] = vi.mocked(useModal().openDialog).mock.calls[0];
    options.resolve.onPick(h.commands[0]);
    expect(h.pickCommand).toHaveBeenCalledWith('status');
  });

  it('renders the room name as a link to the project when projectUuid is set', () => {
    const router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);
    router.stateRegistry.register({
      name: 'project.dashboard',
      url: '/projects/:uuid',
    });
    render(
      <UIRouter router={router}>
        <MatrixChatHeader
          roomUuid="room-1"
          roomName="LLM Training Pipeline"
          projectUuid="project-uuid-123"
        />
      </UIRouter>,
    );
    expect(
      screen.getByRole('link', { name: 'LLM Training Pipeline' }),
    ).toBeInTheDocument();
  });

  it('renders the room name as plain text when projectUuid is missing', () => {
    renderHeader();
    expect(
      screen.queryByRole('link', { name: 'LLM Training Pipeline' }),
    ).toBeNull();
    expect(screen.getByText('LLM Training Pipeline')).toBeTruthy();
  });

  it('renders the notifications item in the kebab and not mark-as-read', async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    expect(await screen.findByText('Notifications')).toBeTruthy();
    expect(screen.queryByText('Mark as read')).toBeNull();
  });

  const syncedClient = () => {
    const client = Object.assign(new EventEmitter(), {
      id: 'c',
      getRooms: () => [],
    });
    h.matrixClient = {
      client,
      activeRoomId: '!room:server',
      activeRoomUuid: 'room-1',
      connectionState: 'connected',
    };
    return client;
  };

  // By keyboard, as the Menu stories do: jsdom has no layout, so a pointer
  // leaving the trigger closes the submenu before it reaches a level.
  const openNotifications = async (
    user: ReturnType<typeof userEvent.setup>,
    container: HTMLElement,
  ) => {
    await user.click(actionsToggle(container));
    act(() => screen.getByRole('menuitem', { name: 'Notifications' }).focus());
    await user.keyboard('{ArrowRight}');
  };

  const pickLevel = async (
    user: ReturnType<typeof userEvent.setup>,
    name: string,
  ) => {
    const item = await screen.findByRole('menuitemradio', { name });
    act(() => item.focus());
    await user.keyboard('{Enter}');
  };

  // The level is read from the active room, so another view can't show it.
  it('disables Notifications in the view without the active room', async () => {
    const user = userEvent.setup();
    syncedClient();
    h.matrixClient.activeRoomUuid = 'other-room';
    h.getRoomNotificationLevel.mockReturnValue('mute');
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    const trigger = await screen.findByRole('menuitem', {
      name: 'Notifications',
    });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.hover(trigger);
    expect(
      await screen.findByRole('tooltip', {
        name: 'The conversation is not open yet.',
      }),
    ).toBeInTheDocument();
  });

  it('disables Notifications while not connected', async () => {
    const user = userEvent.setup();
    syncedClient();
    h.matrixClient.connectionState = 'error';
    const { container } = renderHeader();
    await user.click(actionsToggle(container));
    const trigger = await screen.findByRole('menuitem', {
      name: 'Notifications',
    });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.hover(trigger);
    expect(
      await screen.findByRole('tooltip', { name: 'Not connected' }),
    ).toBeInTheDocument();
  });

  it('shows the three levels with the current one checked', async () => {
    const user = userEvent.setup();
    syncedClient();
    h.getRoomNotificationLevel.mockReturnValue('mute');
    const { container } = renderHeader();
    await openNotifications(user, container);
    expect(
      await screen.findByRole('menuitemradio', { name: 'Mute' }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: 'All messages' }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('menuitemradio', { name: 'Mentions only' }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('sets the picked level and shows a success toast', async () => {
    const user = userEvent.setup();
    const client = syncedClient();
    const { container } = renderHeader();
    await openNotifications(user, container);
    await pickLevel(user, 'Mute');
    expect(h.setRoomNotificationLevel).toHaveBeenCalledWith(
      client,
      '!room:server',
      'mute',
    );
    await vi.waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Notification level updated.',
      ),
    );
  });

  // The level syncs from other tabs and clients: push rules (Mute) arrive as
  // global account data, the stored level (All, Mentions only) as the room's.
  it.each([
    ['accountData', 'mute', 'Mute'],
    ['Room.accountData', 'all', 'All messages'],
  ])(
    'follows a level changed elsewhere, from %s',
    async (eventName, level, label) => {
      const user = userEvent.setup();
      const client = syncedClient();
      const { container } = renderHeader();
      h.getRoomNotificationLevel.mockReturnValue(level);
      act(() => {
        client.emit(eventName);
      });
      await openNotifications(user, container);
      expect(
        await screen.findByRole('menuitemradio', { name: label }),
      ).toHaveAttribute('aria-checked', 'true');
    },
  );

  it('shows an error toast when setting the level fails', async () => {
    const user = userEvent.setup();
    syncedClient();
    h.setRoomNotificationLevel = vi
      .fn()
      .mockRejectedValue(new Error('forbidden'));
    const { container } = renderHeader();
    await openNotifications(user, container);
    await pickLevel(user, 'All messages');
    await vi.waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'Could not update notification level.',
      ),
    );
    expect(useNotify().showSuccess).not.toHaveBeenCalled();
  });
});
