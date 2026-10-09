import { Track } from 'livekit-client';

import { translate } from '@/i18n';

export type CallDeviceSource =
  Track.Source.Microphone | Track.Source.Camera | Track.Source.ScreenShare;

export type CallDeviceErrorKind =
  | 'cancelled'
  | 'permission-denied'
  | 'not-found'
  | 'in-use'
  | 'unsupported'
  | 'other';

/**
 * Classify a failure reported by a LiveKit track toggle. The names are the
 * DOMException names getUserMedia / getDisplayMedia reject with (plus the
 * legacy Chrome aliases LiveKit's own MediaDeviceFailure also accepts).
 *
 * Screen sharing is the odd one: browsers reject getDisplayMedia with the
 * same NotAllowedError whether the user closed the picker or something
 * refused the capture. Only Chrome tells the two apart, by saying the
 * permission was denied "by system" when the OS blocks screen recording.
 * Everything else is treated as the user changing their mind.
 */
export function classifyCallDeviceError(
  error: Error,
  source: CallDeviceSource,
): CallDeviceErrorKind {
  const name = error?.name;
  const isScreenShare = source === Track.Source.ScreenShare;
  switch (name) {
    case 'SecurityError':
      // The page may not capture the screen at all here (an insecure
      // context or a permissions policy), so this is not a closed picker.
      if (isScreenShare) return 'unsupported';
      return 'permission-denied';
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      if (isScreenShare && !/by system/i.test(error.message || '')) {
        return 'cancelled';
      }
      return 'permission-denied';
    case 'AbortError':
      return isScreenShare ? 'cancelled' : 'other';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'not-found';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'in-use';
    case 'DeviceUnsupportedError':
      return 'unsupported';
    default:
      return 'other';
  }
}

/**
 * The message to show the user for a failed toggle, or null when the
 * failure needs no message (a cancelled screen-share picker).
 */
export function getCallDeviceErrorMessage(
  error: Error,
  source: CallDeviceSource,
): string | null {
  const kind = classifyCallDeviceError(error, source);
  if (kind === 'cancelled') {
    return null;
  }
  if (source === Track.Source.ScreenShare) {
    switch (kind) {
      case 'permission-denied':
        return translate(
          'Screen sharing is blocked. Allow screen recording for your browser in the system settings.',
        );
      case 'unsupported':
        return translate('Your browser does not support screen sharing.');
      default:
        return translate('Could not share your screen.');
    }
  }
  const isCamera = source === Track.Source.Camera;
  switch (kind) {
    case 'permission-denied':
      return isCamera
        ? translate(
            'Access to the camera was denied. Allow it in your browser settings and try again.',
          )
        : translate(
            'Access to the microphone was denied. Allow it in your browser settings and try again.',
          );
    case 'not-found':
      return isCamera
        ? translate('No camera was found.')
        : translate('No microphone was found.');
    case 'in-use':
      return isCamera
        ? translate('The camera is in use by another application.')
        : translate('The microphone is in use by another application.');
    default:
      return isCamera
        ? translate('Could not turn on the camera.')
        : translate('Could not turn on the microphone.');
  }
}
