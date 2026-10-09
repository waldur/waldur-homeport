import { act, renderHook } from '@testing-library/react';
import { FC, PropsWithChildren, useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  client: null as any,
  activeRoomId: null as string | null,
  activeRoomUuid: null as string | null,
  connectionState: 'connected' as string,
  acquireToken: vi.fn(),
  discover: vi.fn(),
  tokenError: null as string | null,
  rtcAvailable: true,
  callMembers: [],
}));

vi.mock('../useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: h.activeRoomId,
    activeRoomUuid: h.activeRoomUuid,
    connectionState: h.connectionState,
  }),
}));

vi.mock('./useLiveKitToken', () => ({
  useLiveKitToken: () => ({
    rtcAvailable: h.rtcAvailable,
    discover: h.discover,
    getFocus: (roomId: string) =>
      Promise.resolve({
        type: 'livekit',
        livekit_service_url: 'https://lk.test',
        livekit_alias: roomId,
      }),
    acquireToken: h.acquireToken,
    error: h.tokenError,
  }),
}));

vi.mock('./useCallMemberEvents', () => ({
  useCallMemberEvents: () => ({ callMembers: h.callMembers }),
  announceCallJoin: vi.fn().mockResolvedValue(undefined),
  announceCallLeave: vi.fn().mockResolvedValue(undefined),
  getCallMemberStateKey: (_client: any, _roomId: string, deviceId: string) =>
    `_@me:s_${deviceId}_m.call`,
}));

import {
  MEMBERSHIP_EXPIRY_MS,
  MEMBERSHIP_REFRESH_HEADROOM_MS,
  MEMBERSHIP_REFRESH_RETRY_MS,
} from './callMembership';
import { MatrixCallContext } from './MatrixCallContext';
import {
  CALL_CONNECT_TIMEOUT_MS,
  MatrixCallProvider,
} from './MatrixCallProvider';
import { announceCallJoin, announceCallLeave } from './useCallMemberEvents';

beforeEach(() => {
  h.client = {
    getUserId: () => '@me:s',
    getDeviceId: () => 'dev-1',
    on: vi.fn(),
    removeListener: vi.fn(),
  };
  h.activeRoomId = '!abc:s';
  h.activeRoomUuid = 'uuid-1';
  h.connectionState = 'connected';
  h.tokenError = null;
  h.acquireToken.mockReset();
  h.acquireToken.mockResolvedValue({ url: 'wss://lk', jwt: 'tok' });
  vi.mocked(announceCallJoin).mockClear();
  vi.mocked(announceCallLeave).mockClear();
});

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MatrixCallProvider>{children}</MatrixCallProvider>
);

const useCtx = () => useContext(MatrixCallContext);

describe('MatrixCallProvider', () => {
  it('captures callRoomUuid alongside callRoomId on startCall', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    expect(result.current.callRoomId).toBe('!abc:s');
    expect(result.current.callRoomUuid).toBe('uuid-1');
  });

  it('ends the call when the chat session ends', async () => {
    // An ended session takes the client away: no heartbeat and no way to
    // announce the leave, so media must not keep flowing on its own.
    const { result, rerender } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.markConnected());

    h.client = null;
    h.activeRoomId = null;
    h.connectionState = 'ended';
    rerender();

    expect(result.current.callState).toBe('idle');
    expect(result.current.credentials).toBeNull();
  });

  it('clears callRoomUuid on endCall', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.endCall());
    expect(result.current.callRoomUuid).toBeNull();
  });

  it('re-announces call membership only shortly before it expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });
      act(() => result.current.markConnected());

      const join = vi.mocked(announceCallJoin);
      expect(join).toHaveBeenCalledTimes(1);
      const first = join.mock.calls[0][3];
      expect(join.mock.calls[0][2]).toBe('dev-1');
      expect(first.expires).toBe(MEMBERSHIP_EXPIRY_MS);

      // No heartbeat: well into the membership's life, nothing more is sent.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS - 1_000,
        );
      });
      expect(join).toHaveBeenCalledTimes(1);

      // Just before expiry it is re-sent once, joined-at unchanged.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      expect(join).toHaveBeenCalledTimes(2);
      const second = join.mock.calls[1][3];
      expect(second.createdTs).toBe(first.createdTs);
      expect(second.expires).toBeGreaterThan(
        2 * MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS - 1_000,
      );

      act(() => result.current.endCall());
      // The leave is queued behind earlier announces; let it run.
      await act(() => vi.advanceTimersByTimeAsync(0));
      expect(vi.mocked(announceCallLeave)).toHaveBeenCalledWith(
        h.client,
        '!abc:s',
        'dev-1',
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2 * MEMBERSHIP_EXPIRY_MS);
      });
      expect(join).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('retries a failed membership refresh', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const join = vi.mocked(announceCallJoin);
      join
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue(undefined);
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });
      act(() => result.current.markConnected());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS + 1_000,
        );
      });
      expect(join).toHaveBeenCalledTimes(2);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(MEMBERSHIP_REFRESH_RETRY_MS + 1_000);
      });
      expect(join).toHaveBeenCalledTimes(3);
      act(() => result.current.endCall());
    } finally {
      vi.useRealTimers();
    }
  });

  it('endCall(message) surfaces the message via context error', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.endCall('ICE failed'));
    expect(result.current.error).toBe('ICE failed');
    expect(result.current.callState).toBe('error');
  });

  it('times out to error when the connection never completes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });
      expect(result.current.callState).toBe('connecting');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(CALL_CONNECT_TIMEOUT_MS + 100);
      });

      expect(result.current.callState).toBe('error');
      expect(result.current.error).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not time out once the call connects', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });
      act(() => result.current.markConnected());
      expect(result.current.callState).toBe('connected');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(CALL_CONNECT_TIMEOUT_MS + 100);
      });

      expect(result.current.callState).toBe('connected');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the room anchored with a friendly message when token acquisition fails', async () => {
    h.acquireToken.mockResolvedValue(null);
    h.tokenError = 'Token exchange failed: {"errcode":"M_UNKNOWN"}';
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    expect(result.current.callState).toBe('error');
    // Anchored to its room so the error panel docks in place, not floating.
    expect(result.current.callRoomId).toBe('!abc:s');
    expect(result.current.callRoomUuid).toBe('uuid-1');
    // The raw SFU/token error must never reach the user.
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).not.toContain('errcode');
    // The membership published before the token request is withdrawn.
    await act(async () => {
      await Promise.resolve();
    });
    expect(vi.mocked(announceCallLeave)).toHaveBeenCalledWith(
      h.client,
      '!abc:s',
      'dev-1',
    );
  });

  it('publishes the membership before requesting the call token', async () => {
    const order: string[] = [];
    vi.mocked(announceCallJoin).mockImplementationOnce(() => {
      order.push('join');
      return Promise.resolve();
    });
    h.acquireToken.mockImplementationOnce(() => {
      order.push('token');
      return Promise.resolve({ url: 'wss://lk', jwt: 'tok' });
    });
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    expect(order).toEqual(['join', 'token']);
    expect(vi.mocked(announceCallJoin).mock.calls[0][2]).toBe('dev-1');
    expect(result.current.callState).toBe('connecting');
  });

  it('fails the call without a token request when publishing fails', async () => {
    vi.mocked(announceCallJoin).mockRejectedValueOnce(new Error('forbidden'));
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    expect(h.acquireToken).not.toHaveBeenCalled();
    expect(result.current.callState).toBe('error');
  });

  it('re-publishes the membership when someone else clears it', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.markConnected());
    const handler = h.client.on.mock.calls.at(-1)[1];
    const stateEvent = (sender: string, stateKey: string) => ({
      getRoomId: () => '!abc:s',
      getType: () => 'org.matrix.msc3401.call.member',
      getStateKey: () => stateKey,
      getSender: () => sender,
    });
    const join = vi.mocked(announceCallJoin);
    const before = join.mock.calls.length;

    // Our own writes and other devices' keys are left alone.
    await act(async () => {
      handler(stateEvent('@me:s', '_@me:s_dev-1_m.call'));
      handler(stateEvent('@mallory:s', '_@me:s_dev-2_m.call'));
      await Promise.resolve();
    });
    expect(join.mock.calls.length).toBe(before);

    await act(async () => {
      handler(stateEvent('@mallory:s', '_@me:s_dev-1_m.call'));
      await Promise.resolve();
    });
    expect(join.mock.calls.length).toBe(before + 1);
    expect(join.mock.calls.at(-1)?.[3]).toEqual(join.mock.calls[0][3]);
  });

  it('keeps the room anchored on endCall(message) so the error can dock', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.endCall('ICE failed'));
    expect(result.current.callState).toBe('error');
    expect(result.current.callRoomId).toBe('!abc:s');
    expect(result.current.callRoomUuid).toBe('uuid-1');
  });

  it('markConnected is a no-op after endCall', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.endCall());
    act(() => result.current.markConnected());
    expect(result.current.callState).toBe('idle');
    expect(result.current.callRoomId).toBeNull();
  });

  it('endCall waits for an in-flight announceCallJoin before announceCallLeave', async () => {
    const order: string[] = [];
    let resolveJoin!: () => void;
    vi.mocked(announceCallJoin).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          order.push('join-start');
          resolveJoin = () => {
            order.push('join-resolved');
            resolve();
          };
        }),
    );
    vi.mocked(announceCallLeave).mockImplementation(() => {
      order.push('leave');
      return Promise.resolve();
    });

    const { result } = renderHook(useCtx, { wrapper });

    // Start the call without awaiting — we need to interrupt mid-flight.
    // Flush microtasks until announceCallJoin starts (resolveJoin is assigned).
    let startDone = false;
    result.current.startCall().then(() => {
      startDone = true;
    });
    // Drain microtasks: acquireToken resolves, then queueAnnounce runs the
    // join mock (assigning resolveJoin) before we proceed.
    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    // join is in-flight; endCall should queue behind it.
    act(() => result.current.endCall());

    // Now unblock the join.
    resolveJoin();

    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    expect(startDone).toBe(true);
    expect(order).toEqual(['join-start', 'join-resolved', 'leave']);
  });
});
