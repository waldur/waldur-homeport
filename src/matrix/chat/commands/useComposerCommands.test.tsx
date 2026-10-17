import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '@/test/harness';

import { fetchRoomCommands } from './api';
import { useComposerCommands } from './useComposerCommands';

const h = vi.hoisted(() => ({
  chatEnabled: true,
  client: {
    connectionState: 'connected',
    activeRoomUuid: 'room-1',
    roomAccessDenied: false,
    userId: '@me:s',
  } as any,
  call: {
    offered: true,
    canStart: true,
    reason: undefined as string | undefined,
    inThisRoomsCall: false,
    busy: false,
  },
  callMembers: [] as Array<{ userId: string; deviceId: string }>,
  callRoomUuid: null as string | null,
  startCall: vi.fn(),
}));

vi.mock('@/matrix/utils', () => ({
  isMatrixChatEnabled: () => h.chatEnabled,
}));
vi.mock('../useMatrixClient', () => ({ useMatrixClient: () => h.client }));
vi.mock('../call/useMatrixCall', () => ({
  useMatrixCall: () => ({
    callMembers: h.callMembers,
    callRoomUuid: h.callRoomUuid,
    startCall: h.startCall,
  }),
}));
vi.mock('../call/useCallAvailability', () => ({
  useCallAvailability: () => h.call,
}));
vi.mock('./api', () => ({ fetchRoomCommands: vi.fn() }));

const TICKET = {
  name: 'ticket',
  source: 'bot' as const,
  available: false,
  reason: 'Support tickets cannot be drafted here.',
};

const names = (result: { current: ReturnType<typeof useComposerCommands> }) =>
  result.current.commands.map((c) => `${c.name}:${c.available}`);

describe('useComposerCommands', () => {
  beforeEach(() => {
    h.chatEnabled = true;
    h.client = {
      connectionState: 'connected',
      activeRoomUuid: 'room-1',
      roomAccessDenied: false,
      userId: '@me:s',
      client: { getDeviceId: () => 'MYDEVICE' },
    };
    h.call = {
      offered: true,
      canStart: true,
      reason: undefined,
      inThisRoomsCall: false,
      busy: false,
    };
    h.callMembers = [];
    h.callRoomUuid = null;
    vi.mocked(fetchRoomCommands).mockReset().mockResolvedValue([TICKET]);
  });

  it('lists the backend’s commands for this user, then /call', async () => {
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() =>
      expect(names(result)).toEqual(['ticket:false', 'call:true']),
    );
    expect(fetchRoomCommands).toHaveBeenCalledWith('room-1');
    expect(result.current.commands[1]).toMatchObject({
      source: 'client',
      description: 'Start a call in this room',
    });
  });

  it('says whether the bot’s commands are loaded', async () => {
    const { result } = renderHookWithProviders(() => useComposerCommands());
    expect(result.current.botCommandsLoaded).toBe(false);
    expect(names(result)).toEqual(['call:true']);
    await waitFor(() => expect(result.current.botCommandsLoaded).toBe(true));
  });

  it('keeps /call, and says the list is not loaded, when it fails', async () => {
    vi.mocked(fetchRoomCommands).mockReset().mockRejectedValue(new Error('x'));
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() => expect(fetchRoomCommands).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.botCommandsLoaded).toBe(false);
    expect(names(result)).toEqual(['call:true']);
  });

  it('asks again for another user', async () => {
    const { result, rerender } = renderHookWithProviders(() =>
      useComposerCommands(),
    );
    await waitFor(() => expect(result.current.commands).toHaveLength(2));
    h.client = { ...h.client, userId: '@other:s' };
    rerender();
    await waitFor(() => expect(fetchRoomCommands).toHaveBeenCalledTimes(2));
  });

  it('asks for the new room’s list on a room switch, and keeps none of the old', async () => {
    const { result, rerender } = renderHookWithProviders(() =>
      useComposerCommands(),
    );
    await waitFor(() => expect(result.current.botCommandsLoaded).toBe(true));
    let answer: (commands: unknown[]) => void = () => {};
    vi.mocked(fetchRoomCommands).mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }) as any,
    );
    h.client = { ...h.client, activeRoomUuid: 'room-2' };
    rerender();
    expect(fetchRoomCommands).toHaveBeenLastCalledWith('room-2');
    expect(result.current.botCommandsLoaded).toBe(false);
    expect(names(result)).toEqual(['call:true']);
    answer([{ ...TICKET, available: true }]);
    await waitFor(() =>
      expect(names(result)).toEqual(['ticket:true', 'call:true']),
    );
  });

  it.each([
    ['another member', { userId: '@other:s', deviceId: 'D' }],
    ['your other device', { userId: '@me:s', deviceId: 'PHONE' }],
  ])('offers joining when %s is in the call', async (_name, member) => {
    h.callMembers = [member];
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() => expect(result.current.commands).toHaveLength(2));
    expect(result.current.commands[1].description).toBe(
      'Join the call in progress',
    );
  });

  it('offers no joining for only this device in the call', async () => {
    h.callMembers = [{ userId: '@me:s', deviceId: 'MYDEVICE' }];
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() => expect(result.current.commands).toHaveLength(2));
    expect(result.current.commands[1].description).toBe(
      'Start a call in this room',
    );
  });

  it('does not take another room’s call for one here', async () => {
    // In a call, the members are those of the call's room.
    h.callRoomUuid = 'room-2';
    h.callMembers = [{ userId: '@other:s', deviceId: 'D' }];
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() => expect(result.current.commands).toHaveLength(2));
    expect(result.current.commands[1].description).toBe(
      'Start a call in this room',
    );
  });

  it('marks /call unavailable with the call action’s reason', async () => {
    h.call = { ...h.call, canStart: false, reason: 'Disconnect first.' };
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() => expect(result.current.commands).toHaveLength(2));
    expect(result.current.commands[1]).toMatchObject({
      available: false,
      reason: 'Disconnect first.',
    });
  });

  it('leaves /call out where calls are not offered', async () => {
    h.call = { ...h.call, offered: false };
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await waitFor(() => expect(names(result)).toEqual(['ticket:false']));
  });

  it.each([
    ['chat is disabled', () => (h.chatEnabled = false)],
    ['the client is not connected', () => (h.client.connectionState = 'error')],
    ['no room is open', () => (h.client.activeRoomUuid = null)],
    ['the user is not a member', () => (h.client.roomAccessDenied = true)],
  ])('offers nothing when %s', async (_name, gate) => {
    gate();
    const { result } = renderHookWithProviders(() => useComposerCommands());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.commands).toEqual([]);
    expect(fetchRoomCommands).not.toHaveBeenCalled();
  });

  it('starts the call for /call', () => {
    const { result } = renderHookWithProviders(() => useComposerCommands());
    result.current.runClientCommand({
      name: 'call',
      source: 'client',
      available: true,
    });
    expect(h.startCall).toHaveBeenCalled();
  });
});
