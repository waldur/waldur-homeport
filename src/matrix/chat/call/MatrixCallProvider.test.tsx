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
    acquireToken: h.acquireToken,
    error: h.tokenError,
  }),
}));

vi.mock('./useCallMemberEvents', () => ({
  useCallMemberEvents: () => ({ callMembers: h.callMembers }),
  announceCallJoin: vi.fn().mockResolvedValue(undefined),
  announceCallLeave: vi.fn().mockResolvedValue(undefined),
  CALL_MEMBER_REFRESH_MS: 10_000,
}));

import { MatrixCallContext } from './MatrixCallContext';
import {
  CALL_CONNECT_TIMEOUT_MS,
  MatrixCallProvider,
} from './MatrixCallProvider';
import { announceCallJoin, announceCallLeave } from './useCallMemberEvents';

beforeEach(() => {
  h.client = { getUserId: () => '@me:s' };
  h.activeRoomId = '!abc:s';
  h.activeRoomUuid = 'uuid-1';
  h.connectionState = 'connected';
  h.tokenError = null;
  h.acquireToken.mockReset();
  h.acquireToken.mockResolvedValue({ url: 'wss://lk', jwt: 'tok' });
  vi.mocked(announceCallJoin).mockClear();
  vi.mocked(announceCallLeave).mockClear();
  sessionStorage.setItem('waldur_matrix_device_id', 'dev-1');
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

  it('clears callRoomUuid on endCall', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.endCall());
    expect(result.current.callRoomUuid).toBeNull();
  });

  it('re-announces call membership periodically while connected', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });
      act(() => result.current.markConnected());

      expect(vi.mocked(announceCallJoin)).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(11_000);
      });
      expect(vi.mocked(announceCallJoin)).toHaveBeenCalledTimes(2);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });
      expect(vi.mocked(announceCallJoin)).toHaveBeenCalledTimes(3);

      act(() => result.current.endCall());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });
      expect(vi.mocked(announceCallJoin)).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('heartbeat ticks while still connecting', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(announceCallJoin).mockClear();
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });
      expect(result.current.callState).toBe('connecting');
      // startCall itself triggers an initial announceCallJoin
      const callsAfterStart = vi.mocked(announceCallJoin).mock.calls.length;

      // Advance past CALL_MEMBER_REFRESH_MS (10_000ms) — heartbeat should tick
      await act(async () => {
        await vi.advanceTimersByTimeAsync(11_000);
      });

      expect(vi.mocked(announceCallJoin).mock.calls.length).toBeGreaterThan(
        callsAfterStart,
      );
    } finally {
      vi.useRealTimers();
      vi.mocked(announceCallJoin).mockClear();
      vi.mocked(announceCallLeave).mockClear();
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
