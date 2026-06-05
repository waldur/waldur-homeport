import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';

import { useReactions } from './useReactions';

const sendEvent = vi.fn();
const redactEvent = vi.fn();

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: {
      sendEvent: (...args: any[]) => sendEvent(...args),
      redactEvent: (...args: any[]) => redactEvent(...args),
      getUserId: () => '@me:server',
    },
    activeRoomId: '!room:server',
    userId: '@me:server',
  }),
}));

describe('useReactions', () => {
  beforeEach(() => {
    sendEvent.mockReset().mockResolvedValue({ event_id: 'echo' });
    redactEvent.mockReset().mockResolvedValue({ event_id: 'redacted' });
    vi.mocked(useNotify().showError).mockClear();
  });

  it('react() sends an m.reaction event with the correct content', async () => {
    const { result } = renderHook(() =>
      useReactions({ eventId: 'msg-1', reactions: [] }),
    );

    await act(async () => {
      await result.current.react('👍');
    });

    expect(sendEvent).toHaveBeenCalledWith('!room:server', 'm.reaction', {
      'm.relates_to': {
        rel_type: 'm.annotation',
        event_id: 'msg-1',
        key: '👍',
      },
    });
  });

  it('react() on an already-reacted key calls unreact instead', async () => {
    const { result } = renderHook(() =>
      useReactions({
        eventId: 'msg-1',
        reactions: [
          { key: '👍', count: 1, reactedByMe: true, myEventId: 'mine-r1' },
        ],
      }),
    );

    await act(async () => {
      await result.current.react('👍');
    });

    expect(sendEvent).not.toHaveBeenCalled();
    expect(redactEvent).toHaveBeenCalledWith('!room:server', 'mine-r1');
  });

  it('unreact() redacts the user own reaction event', async () => {
    const { result } = renderHook(() =>
      useReactions({
        eventId: 'msg-1',
        reactions: [
          { key: '👍', count: 1, reactedByMe: true, myEventId: 'mine-r1' },
        ],
      }),
    );

    await act(async () => {
      await result.current.unreact('👍');
    });

    expect(redactEvent).toHaveBeenCalledWith('!room:server', 'mine-r1');
  });

  it('unreact() no-ops when there is no myEventId', async () => {
    const { result } = renderHook(() =>
      useReactions({ eventId: 'msg-1', reactions: [] }),
    );

    await act(async () => {
      await result.current.unreact('👍');
    });

    expect(redactEvent).not.toHaveBeenCalled();
  });

  it('react() shows an error toast when sendEvent rejects', async () => {
    sendEvent.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() =>
      useReactions({ eventId: 'msg-1', reactions: [] }),
    );

    await act(async () => {
      await result.current.react('👍');
    });

    expect(useNotify().showError).toHaveBeenCalled();
  });

  it('unreact() swallows 404 silently', async () => {
    redactEvent.mockRejectedValueOnce(
      Object.assign(new Error('not found'), { httpStatus: 404 }),
    );
    const { result } = renderHook(() =>
      useReactions({
        eventId: 'msg-1',
        reactions: [
          { key: '👍', count: 1, reactedByMe: true, myEventId: 'mine-r1' },
        ],
      }),
    );

    await act(async () => {
      await result.current.unreact('👍');
    });

    expect(useNotify().showError).not.toHaveBeenCalled();
  });

  it('unreact() shows an error toast for non-404 failures', async () => {
    redactEvent.mockRejectedValueOnce(
      Object.assign(new Error('server error'), { httpStatus: 500 }),
    );
    const { result } = renderHook(() =>
      useReactions({
        eventId: 'msg-1',
        reactions: [
          { key: '👍', count: 1, reactedByMe: true, myEventId: 'mine-r1' },
        ],
      }),
    );

    await act(async () => {
      await result.current.unreact('👍');
    });

    expect(useNotify().showError).toHaveBeenCalled();
  });
});
