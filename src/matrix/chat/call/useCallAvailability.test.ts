import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCallAvailability } from './useCallAvailability';

const h = vi.hoisted(() => ({
  stateEvent: false,
  cryptoRemembers: false,
  client: null as any,
  activeRoomUuid: 'room-1' as string | null,
}));

vi.mock('./callEncryption', () => ({ canEncryptCallMedia: () => false }));
vi.mock('./useMatrixCall', () => ({
  useMatrixCall: () => ({
    rtcAvailable: true,
    callState: 'idle',
    callRoomUuid: null,
  }),
}));
vi.mock('../useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: '!r:s',
    activeRoomUuid: h.activeRoomUuid,
  }),
}));

const ENCRYPTED_REASON = "This browser can't take part in encrypted calls.";

describe('useCallAvailability', () => {
  beforeEach(() => {
    h.stateEvent = false;
    h.cryptoRemembers = false;
    h.activeRoomUuid = 'room-1';
    h.client = {
      getRoom: () => ({ hasEncryptionStateEvent: () => h.stateEvent }),
      getCrypto: () => ({
        isEncryptionEnabledInRoom: vi.fn(() =>
          Promise.resolve(h.cryptoRemembers),
        ),
      }),
    };
  });

  it('reads encryption from the room’s state event', () => {
    h.stateEvent = true;
    const { result } = renderHook(() => useCallAvailability());
    expect(result.current.reason).toBe(ENCRYPTED_REASON);
  });

  it('reads encryption crypto remembers for the room, as a call does', async () => {
    h.cryptoRemembers = true;
    const { result } = renderHook(() => useCallAvailability());
    await waitFor(() => expect(result.current.reason).toBe(ENCRYPTED_REASON));
    expect(result.current.canStart).toBe(false);
  });

  it('allows a call in a room that is not encrypted', async () => {
    const { result } = renderHook(() => useCallAvailability());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.canStart).toBe(true);
  });

  it('takes a room it can’t read yet to be encrypted, as every room is', async () => {
    // The active room is not encrypted, so its state can't have leaked in.
    const { result } = renderHook(() => useCallAvailability('room-2'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.reason).toBe(ENCRYPTED_REASON);
    expect(result.current.canStart).toBe(false);
  });
});
