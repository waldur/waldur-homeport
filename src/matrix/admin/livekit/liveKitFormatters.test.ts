import { describe, expect, it } from 'vitest';

import {
  formatTrackResolution,
  getErrorDetail,
  isNotConfiguredError,
} from './liveKitFormatters';

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
      expect(
        formatTrackResolution({
          type: 'VIDEO',
          width: 1280,
          height: 720,
        } as any),
      ).toBe('1280×720');
    });

    it('returns null for audio tracks', () => {
      expect(
        formatTrackResolution({ type: 'AUDIO', width: 0, height: 0 } as any),
      ).toBeNull();
    });

    it('returns null for a video track without dimensions', () => {
      expect(
        formatTrackResolution({ type: 'VIDEO', width: 0, height: 0 } as any),
      ).toBeNull();
    });
  });
});
