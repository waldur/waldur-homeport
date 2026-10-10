import { act, renderHook } from '@testing-library/react';
import { FC, PropsWithChildren, useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  joinCallSession: vi.fn(),
  handles: [] as any[],
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
}));

vi.mock('./rtcSession', () => ({ joinCallSession: h.joinCallSession }));

import { MatrixCallContext } from './MatrixCallContext';
import {
  CALL_CONNECT_TIMEOUT_MS,
  MatrixCallProvider,
} from './MatrixCallProvider';

// A call session whose membership lands at once, unless `joined` is given.
const fakeHandle = (joined: Promise<void> = Promise.resolve()) => {
  let lose!: () => void;
  const handle = {
    session: { id: h.handles.length },
    joined,
    lost: new Promise<void>((r) => (lose = r)),
    lose: () => lose(),
    leave: vi.fn(() => Promise.resolve()),
  };
  h.handles.push(handle);
  return handle;
};

beforeEach(() => {
  h.client = {
    getUserId: () => '@me:s',
    getDeviceId: () => 'dev-1',
    getRoom: (roomId: string) => ({ roomId }),
  };
  h.activeRoomId = '!abc:s';
  h.activeRoomUuid = 'uuid-1';
  h.connectionState = 'connected';
  h.tokenError = null;
  h.acquireToken.mockReset();
  h.acquireToken.mockResolvedValue({ url: 'wss://lk', jwt: 'tok' });
  h.handles = [];
  h.joinCallSession.mockReset();
  h.joinCallSession.mockImplementation(() => Promise.resolve(fakeHandle()));
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

  it('joins the room call with its own focus and leaves on hang-up', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    expect(h.joinCallSession).toHaveBeenCalledWith(
      h.client,
      { roomId: '!abc:s' },
      [
        {
          type: 'livekit',
          livekit_service_url: 'https://lk.test',
          livekit_alias: '!abc:s',
        },
      ],
      { encrypt: false },
    );
    expect(result.current.encrypted).toBe(false);

    act(() => result.current.endCall());
    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
  });

  describe('in an encrypted room', () => {
    beforeEach(() => {
      h.client.getRoom = (roomId: string) => ({
        roomId,
        hasEncryptionStateEvent: () => true,
      });
    });
    afterEach(() => vi.unstubAllGlobals());

    it('encrypts the call and joins under the keyed identity', async () => {
      vi.stubGlobal('RTCRtpScriptTransform', class {});
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });

      expect(h.joinCallSession.mock.calls[0][3]).toEqual({ encrypt: true });
      expect(h.acquireToken.mock.calls[0][2]).toEqual({ encrypted: true });
      expect(result.current.encrypted).toBe(true);
      expect(result.current.callSession).toBe(h.handles[0].session);
    });

    it('stays encrypted when the room state no longer says so', async () => {
      vi.stubGlobal('RTCRtpScriptTransform', class {});
      h.client.getRoom = (roomId: string) => ({
        roomId,
        hasEncryptionStateEvent: () => false,
      });
      h.client.getCrypto = () => ({
        isEncryptionEnabledInRoom: () => Promise.resolve(true),
      });
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });

      expect(h.joinCallSession.mock.calls[0][3]).toEqual({ encrypt: true });
      expect(result.current.encrypted).toBe(true);
    });

    it('refuses to join from a browser that cannot encrypt media', async () => {
      vi.stubGlobal('RTCRtpScriptTransform', undefined);
      vi.stubGlobal('RTCRtpSender', class {});
      const { result } = renderHook(useCtx, { wrapper });
      await act(async () => {
        await result.current.startCall();
      });

      expect(h.joinCallSession).not.toHaveBeenCalled();
      expect(h.acquireToken).not.toHaveBeenCalled();
      expect(result.current.callState).toBe('error');
      expect(result.current.error).toBe(
        "This browser can't take part in encrypted calls.",
      );
    });
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
    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
  });

  it('publishes the membership before requesting the call token', async () => {
    let land!: () => void;
    h.joinCallSession.mockImplementationOnce(() =>
      Promise.resolve(fakeHandle(new Promise<void>((r) => (land = r)))),
    );
    const { result } = renderHook(useCtx, { wrapper });
    let started!: Promise<void>;
    await act(async () => {
      started = result.current.startCall();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(h.acquireToken).not.toHaveBeenCalled();

    await act(async () => {
      land();
      await started;
    });
    expect(h.acquireToken).toHaveBeenCalledTimes(1);
    expect(result.current.callState).toBe('connecting');
  });

  it('fails the call without a token request when publishing fails', async () => {
    h.joinCallSession.mockImplementationOnce(() =>
      Promise.resolve(fakeHandle(Promise.reject(new Error('forbidden')))),
    );
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    expect(h.acquireToken).not.toHaveBeenCalled();
    expect(result.current.callState).toBe('error');
    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
  });

  it('fails the call when the membership never lands', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      h.joinCallSession.mockImplementationOnce(() =>
        Promise.resolve(fakeHandle(new Promise<void>(() => undefined))),
      );
      const { result } = renderHook(useCtx, { wrapper });
      let started!: Promise<void>;
      act(() => {
        started = result.current.startCall();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(CALL_CONNECT_TIMEOUT_MS + 100);
        await started;
      });
      expect(h.acquireToken).not.toHaveBeenCalled();
      expect(result.current.callState).toBe('error');
      expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
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

  it('leaves a session that was still loading when the call ended', async () => {
    let load!: (handle: any) => void;
    h.joinCallSession.mockImplementationOnce(
      () => new Promise((r) => (load = r)),
    );
    const { result } = renderHook(useCtx, { wrapper });
    let started!: Promise<void>;
    await act(async () => {
      started = result.current.startCall();
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => result.current.endCall());
    await act(async () => {
      load(fakeHandle());
      await started;
    });

    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
    expect(h.acquireToken).not.toHaveBeenCalled();
    expect(result.current.callState).toBe('idle');
  });

  it('leaves a running call before starting another one', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    await act(async () => {
      await result.current.startCall();
    });

    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
    expect(h.handles[1].leave).not.toHaveBeenCalled();
  });

  it('ends the call when the session loses the membership', async () => {
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.markConnected());

    await act(async () => {
      h.handles[0].lose();
      await Promise.resolve();
    });

    expect(result.current.callState).toBe('error');
    expect(result.current.error).toBe('The call was disconnected.');
    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
  });

  it('cancels a call still being set up when the chat session ends', async () => {
    let load!: (handle: any) => void;
    h.joinCallSession.mockImplementationOnce(
      () => new Promise((r) => (load = r)),
    );
    const { result, rerender } = renderHook(useCtx, { wrapper });
    let started!: Promise<void>;
    await act(async () => {
      started = result.current.startCall();
      await new Promise((r) => setTimeout(r, 0));
    });

    h.connectionState = 'ended';
    rerender();
    await act(async () => {
      load(fakeHandle());
      await started;
    });

    expect(h.handles[0].leave).toHaveBeenCalledTimes(1);
    expect(h.acquireToken).not.toHaveBeenCalled();
    expect(result.current.callState).toBe('idle');
  });

  it('joins a new call only once the previous leave has landed', async () => {
    let landLeave!: () => void;
    const first = fakeHandle();
    first.leave.mockImplementation(
      () => new Promise<void>((r) => (landLeave = r)),
    );
    h.joinCallSession.mockImplementationOnce(() => Promise.resolve(first));
    const { result } = renderHook(useCtx, { wrapper });
    await act(async () => {
      await result.current.startCall();
    });
    act(() => result.current.endCall());

    let started!: Promise<void>;
    await act(async () => {
      started = result.current.startCall();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(h.joinCallSession).toHaveBeenCalledTimes(1);

    await act(async () => {
      landLeave();
      await started;
    });
    expect(h.joinCallSession).toHaveBeenCalledTimes(2);
  });
});
