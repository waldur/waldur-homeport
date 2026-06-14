import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';

import { MatrixChatHeader } from './MatrixChatHeader';

const h = vi.hoisted(() => ({
  members: [] as any[],
  call: {} as any,
  matrixClient: {} as any,
  isRoomMuted: vi.fn(),
  setRoomMuted: vi.fn(),
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

vi.mock('./mute', () => ({
  isRoomMuted: (...a: any[]) => h.isRoomMuted(...a),
  setRoomMuted: (...a: any[]) => h.setRoomMuted(...a),
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

const renderHeader = (props: Record<string, unknown> = {}) =>
  render(
    <MatrixChatHeader
      roomUuid="room-1"
      roomName="LLM Training Pipeline"
      {...props}
    />,
  );

beforeEach(() => {
  vi.mocked(useNotify().showSuccess).mockClear();
  vi.mocked(useNotify().showError).mockClear();
  h.members = MEMBERS;
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
    activeRoomUuid: null,
  };
  h.isRoomMuted = vi.fn().mockReturnValue(false);
  h.setRoomMuted = vi.fn().mockResolvedValue(undefined);
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
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    expect(await screen.findByText('Start call')).toBeTruthy();
    expect(screen.getByText(/external Matrix client/i)).toBeTruthy();
  });

  it('shows "End call" in the kebab when the active call is in this room', async () => {
    const user = userEvent.setup();
    h.call.rtcAvailable = true;
    h.call.callState = 'connected';
    h.call.callRoomUuid = 'room-1';
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    expect(await screen.findByText('End call')).toBeTruthy();
  });

  it('shows a disabled "Start call" when the active call is in a different room', async () => {
    const user = userEvent.setup();
    h.call.rtcAvailable = true;
    h.call.callState = 'connected';
    h.call.callRoomUuid = 'some-other-room';
    const { container } = renderHeader({ roomAlias: '#llm:server' });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    const item = await screen.findByText('Start call');
    expect(item).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('.dropdown-item')).toHaveClass('disabled');
  });

  it('renders the room name as a link to the project when projectUuid is set', () => {
    const router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);
    router.stateRegistry.register({
      name: 'project.dashboard',
      url: '/projects/:uuid',
    });
    const { container } = render(
      <UIRouter router={router}>
        <MatrixChatHeader
          roomUuid="room-1"
          roomName="LLM Training Pipeline"
          projectUuid="project-uuid-123"
        />
      </UIRouter>,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const link = container.querySelector('a.text-anchor');
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe('LLM Training Pipeline');
  });

  it('renders the room name as plain text when projectUuid is missing', () => {
    const { container } = renderHeader();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('a.text-anchor')).toBeNull();
    expect(screen.getByText('LLM Training Pipeline')).toBeTruthy();
  });

  it('renders the mute item in the kebab and not mark-as-read', async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    expect(await screen.findByText('Mute')).toBeTruthy();
    expect(screen.queryByText('Mark as read')).toBeNull();
  });

  const mutedClient = () => {
    const client = {
      id: 'c',
      on: vi.fn(),
      removeListener: vi.fn(),
      getRooms: () => [],
    };
    h.matrixClient = {
      client,
      activeRoomId: '!room:server',
      activeRoomUuid: 'room-1',
      connectionState: 'connected',
    };
    return client;
  };

  it('mutes the active room and shows a success toast', async () => {
    const user = userEvent.setup();
    const client = mutedClient();
    h.isRoomMuted.mockReturnValue(false);
    const { container } = renderHeader();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    await user.click(await screen.findByText('Mute'));
    expect(h.setRoomMuted).toHaveBeenCalledWith(client, '!room:server', true);
    await vi.waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith('Muted.'),
    );
  });

  it('shows "Unmute" with a bell icon when the room is already muted', async () => {
    const user = userEvent.setup();
    mutedClient();
    h.isRoomMuted.mockReturnValue(true);
    const { container } = renderHeader();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    expect(await screen.findByText('Unmute')).toBeTruthy();
    expect(screen.queryByText('Mute')).toBeNull();
  });

  it('shows an error toast when muting fails', async () => {
    const user = userEvent.setup();
    mutedClient();
    h.isRoomMuted.mockReturnValue(false);
    h.setRoomMuted = vi.fn().mockRejectedValue(new Error('forbidden'));
    const { container } = renderHeader();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    await user.click(container.querySelector('.dropdown-toggle')!);
    await user.click(await screen.findByText('Mute'));
    await vi.waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'Could not update mute setting.',
      ),
    );
  });
});
