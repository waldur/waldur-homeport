import { translate } from '@/i18n';

import { canEncryptCallMedia } from './callEncryption';
import { CallState } from './types';

interface CallAvailabilityInput {
  /** The deployment runs a call service the homeserver advertises. */
  rtcAvailable: boolean;
  callState: CallState;
  /** Waldur room uuid of the call this browser is in, if any. */
  callRoomUuid: string | null;
  /** Waldur room uuid of the room the user is looking at. */
  roomUuid: string | null;
  /** The room is end-to-end encrypted, so its calls are too. */
  roomEncrypted: boolean;
}

export interface CallAvailability {
  /** A call can be offered here at all: hidden, not disabled, otherwise. */
  offered: boolean;
  /** Starting or joining a call here would work now. */
  canStart: boolean;
  /** Why it would not, when offered but not startable. */
  reason?: string;
  /** This browser is in this room's call: the action ends it instead. */
  inThisRoomsCall: boolean;
  busy: boolean;
}

/**
 * Whether the user can start (or join) a call in a room. The room header's
 * call action and the composer's /call both ask this, so they can't disagree.
 */
export function getCallAvailability({
  rtcAvailable,
  callState,
  callRoomUuid,
  roomUuid,
  roomEncrypted,
}: CallAvailabilityInput): CallAvailability {
  const inCall = callState === 'connecting' || callState === 'connected';
  const inThisRoomsCall = inCall && !!roomUuid && callRoomUuid === roomUuid;
  const busy = callState === 'discovering' || callState === 'connecting';
  const offered = rtcAvailable && !!roomUuid;
  let reason: string | undefined;
  if (!offered) {
    reason = translate('Calls are not available on this server.');
  } else if (inCall && !inThisRoomsCall) {
    reason = translate(
      'Disconnect from the current call before starting a new one.',
    );
  } else if (roomEncrypted && !canEncryptCallMedia()) {
    reason = translate("This browser can't take part in encrypted calls.");
  } else if (busy) {
    reason = translate('The call is connecting.');
  } else if (inThisRoomsCall) {
    reason = translate('You are already in this call.');
  }
  return { offered, canStart: !reason, reason, inThisRoomsCall, busy };
}
