import { describe, expect, it } from 'vitest';
import { LiveKitTrack } from 'waldur-js-client';

import {
  formatTrackResolution,
  formatTrackSource,
  getErrorDetail,
  getTrackEncryption,
  isNotConfiguredError,
} from './liveKitFormatters';

const track = (overrides: Partial<LiveKitTrack> = {}): LiveKitTrack => ({
  sid: 'TR_1',
  name: '',
  type: 'VIDEO',
  muted: false,
  width: 0,
  height: 0,
  source: 'CAMERA',
  encryption: 'GCM',
  ...overrides,
});

describe('liveKitFormatters', () => {
  describe('getErrorDetail', () => {
    it('reads detail spread onto the error by the hey-api client', () => {
      // The fetch client throws { ...body, response }, so detail is top-level.
      expect(
        getErrorDetail({
          detail: 'LiveKit is unreachable.',
          response: { status: 502 },
        }),
      ).toBe('LiveKit is unreachable.');
    });

    it('falls back to the axios-style shape', () => {
      expect(getErrorDetail({ response: { data: { detail: 'nope' } } })).toBe(
        'nope',
      );
    });

    it('returns undefined when no detail is present', () => {
      expect(getErrorDetail({ response: { status: 502 } })).toBeUndefined();
      expect(getErrorDetail(undefined)).toBeUndefined();
    });
  });

  describe('isNotConfiguredError', () => {
    it('is true for a 503', () => {
      expect(isNotConfiguredError({ response: { status: 503 } })).toBe(true);
    });

    it('is false for other statuses and missing errors', () => {
      expect(isNotConfiguredError({ response: { status: 502 } })).toBe(false);
      expect(isNotConfiguredError(undefined)).toBe(false);
    });
  });

  describe('formatTrackResolution', () => {
    it('formats video tracks that carry dimensions', () => {
      expect(formatTrackResolution(track({ width: 1280, height: 720 }))).toBe(
        '1280×720',
      );
    });

    it('returns null for audio tracks', () => {
      expect(
        formatTrackResolution(track({ type: 'AUDIO', source: 'MICROPHONE' })),
      ).toBeNull();
    });

    it('returns null for a video track without dimensions', () => {
      expect(formatTrackResolution(track())).toBeNull();
    });
  });

  describe('getTrackEncryption', () => {
    it('reads the values LiveKit reports', () => {
      expect(getTrackEncryption(track({ encryption: 'GCM' }))).toBe('gcm');
      expect(getTrackEncryption(track({ encryption: 'CUSTOM' }))).toBe(
        'custom',
      );
      expect(getTrackEncryption(track({ encryption: 'NONE' }))).toBe('none');
    });

    it('takes anything else as unknown, never as encrypted', () => {
      for (const encryption of ['gcm', 'AES', '']) {
        expect(getTrackEncryption(track({ encryption }))).toBe('unknown');
      }
    });
  });

  describe('formatTrackSource', () => {
    it('names the source', () => {
      expect(formatTrackSource(track({ source: 'SCREEN_SHARE' }))).toBe(
        'Screen share',
      );
      expect(
        formatTrackSource(
          track({ type: 'AUDIO', source: 'SCREEN_SHARE_AUDIO' }),
        ),
      ).toBe('Screen share audio');
    });

    it('falls back to the track type for an unknown source', () => {
      expect(
        formatTrackSource(track({ type: 'AUDIO', source: 'UNKNOWN' })),
      ).toBe('Audio');
    });

    it('falls back to the raw type when that is unknown too', () => {
      expect(formatTrackSource(track({ type: 'DATA', source: '' }))).toBe(
        'DATA',
      );
    });
  });
});
