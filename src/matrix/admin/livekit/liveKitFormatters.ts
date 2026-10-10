import { LiveKitTrack } from 'waldur-js-client';

import { translate } from '@/i18n';

// LiveKit serialises track types as AUDIO / VIDEO / DATA.
export const isVideoTrack = (track: LiveKitTrack): boolean =>
  track.type === 'VIDEO';

// Resolution only makes sense for video tracks that carry dimensions.
export const formatTrackResolution = (track: LiveKitTrack): string | null =>
  isVideoTrack(track) && track.width && track.height
    ? `${track.width}×${track.height}`
    : null;

const formatTrackKind = (track: LiveKitTrack): string => {
  switch (track.type) {
    case 'AUDIO':
      return translate('Audio');
    case 'VIDEO':
      return translate('Video');
    default:
      return track.type;
  }
};

// What a track carries, from LiveKit's track source; its type when the source
// is not known.
export const formatTrackSource = (track: LiveKitTrack): string => {
  switch (track.source) {
    case 'CAMERA':
      return translate('Camera');
    case 'MICROPHONE':
      return translate('Microphone');
    case 'SCREEN_SHARE':
      return translate('Screen share');
    case 'SCREEN_SHARE_AUDIO':
      return translate('Screen share audio');
    default:
      return formatTrackKind(track);
  }
};

// How the publisher encrypts the track, from LiveKit's own names: GCM is
// LiveKit's end-to-end encryption, which calls in encrypted rooms use; CUSTOM
// another end-to-end scheme, unexpected here; NONE media that only the
// connection to LiveKit encrypts, so LiveKit can decode it. Anything else is
// unknown, and never counts as encrypted.
export type TrackEncryption = 'gcm' | 'custom' | 'none' | 'unknown';

export const getTrackEncryption = (track: LiveKitTrack): TrackEncryption => {
  switch (track.encryption) {
    case 'GCM':
      return 'gcm';
    case 'CUSTOM':
      return 'custom';
    case 'NONE':
      return 'none';
    default:
      return 'unknown';
  }
};

// The backend maps a missing LiveKit profile to 503 (a quiet, expected state)
// and an unreachable / credential-rejecting service to 502 (a retryable error).
// The hey-api fetch client attaches the raw Response (with `.status`) and
// spreads the parsed body onto the error, so the status lives on `.response`.
export const isNotConfiguredError = (error: unknown): boolean =>
  (error as any)?.response?.status === 503;

// `detail` is spread onto the error from the response body; only fall back to
// the axios-style shape. (`.response` here is a raw fetch Response with no
// `.data`, so reading `.response.data.detail` always misses.)
export const getErrorDetail = (error: unknown): string | undefined =>
  (error as any)?.detail ?? (error as any)?.response?.data?.detail;
