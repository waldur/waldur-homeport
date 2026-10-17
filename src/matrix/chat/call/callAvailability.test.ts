import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCallAvailability } from './callAvailability';

const encrypt = vi.hoisted(() => ({ supported: true }));
vi.mock('./callEncryption', () => ({
  canEncryptCallMedia: () => encrypt.supported,
}));

const base = {
  rtcAvailable: true,
  callState: 'idle' as const,
  callRoomUuid: null,
  roomUuid: 'room-1',
  roomEncrypted: false,
};

describe('getCallAvailability', () => {
  afterEach(() => {
    encrypt.supported = true;
  });

  it('allows a call in an idle room', () => {
    expect(getCallAvailability(base)).toMatchObject({
      offered: true,
      canStart: true,
      inThisRoomsCall: false,
    });
  });

  it('offers nothing without a call service', () => {
    expect(getCallAvailability({ ...base, rtcAvailable: false })).toMatchObject(
      { offered: false, canStart: false },
    );
  });

  it('blocks a call while in another room’s call', () => {
    expect(
      getCallAvailability({
        ...base,
        callState: 'connected',
        callRoomUuid: 'room-2',
      }),
    ).toMatchObject({
      offered: true,
      canStart: false,
      reason: 'Disconnect from the current call before starting a new one.',
    });
  });

  it('blocks an encrypted room’s call in a browser that cannot encrypt', () => {
    encrypt.supported = false;
    expect(getCallAvailability({ ...base, roomEncrypted: true })).toMatchObject(
      {
        canStart: false,
        reason: "This browser can't take part in encrypted calls.",
      },
    );
    expect(getCallAvailability(base).canStart).toBe(true);
  });

  it('blocks while connecting', () => {
    expect(
      getCallAvailability({ ...base, callState: 'discovering' }),
    ).toMatchObject({ canStart: false, busy: true });
  });

  it('knows when the user is in this room’s call', () => {
    expect(
      getCallAvailability({
        ...base,
        callState: 'connected',
        callRoomUuid: 'room-1',
      }),
    ).toMatchObject({ canStart: false, inThisRoomsCall: true });
  });
});
