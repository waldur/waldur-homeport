import { Track } from 'livekit-client';
import { describe, expect, it } from 'vitest';

import {
  classifyCallDeviceError,
  getCallDeviceErrorMessage,
} from './callDeviceErrors';

const domError = (name: string, message = '') =>
  Object.assign(new Error(message), { name });

describe('classifyCallDeviceError', () => {
  it.each([
    ['NotAllowedError', 'permission-denied'],
    ['PermissionDeniedError', 'permission-denied'],
    ['NotFoundError', 'not-found'],
    ['DevicesNotFoundError', 'not-found'],
    ['OverconstrainedError', 'not-found'],
    ['NotReadableError', 'in-use'],
    ['TrackStartError', 'in-use'],
    ['AbortError', 'other'],
    ['TypeError', 'other'],
  ])('maps %s from the camera to %s', (name, kind) => {
    expect(classifyCallDeviceError(domError(name), Track.Source.Camera)).toBe(
      kind,
    );
  });

  it('treats a refused screen-share picker as a cancel', () => {
    expect(
      classifyCallDeviceError(
        domError('NotAllowedError', 'Permission denied'),
        Track.Source.ScreenShare,
      ),
    ).toBe('cancelled');
    expect(
      classifyCallDeviceError(domError('AbortError'), Track.Source.ScreenShare),
    ).toBe('cancelled');
  });

  it('reports an OS-level screen recording block as permission denied', () => {
    expect(
      classifyCallDeviceError(
        domError('NotAllowedError', 'Permission denied by system'),
        Track.Source.ScreenShare,
      ),
    ).toBe('permission-denied');
  });

  it('recognises a browser without getDisplayMedia', () => {
    expect(
      classifyCallDeviceError(
        domError('DeviceUnsupportedError', 'getDisplayMedia not supported'),
        Track.Source.ScreenShare,
      ),
    ).toBe('unsupported');
  });

  it('reports a page that may not capture the screen as unsupported', () => {
    expect(
      classifyCallDeviceError(
        domError('SecurityError'),
        Track.Source.ScreenShare,
      ),
    ).toBe('unsupported');
    expect(
      classifyCallDeviceError(domError('SecurityError'), Track.Source.Camera),
    ).toBe('permission-denied');
  });
});

describe('getCallDeviceErrorMessage', () => {
  it('stays silent when the screen-share picker is cancelled', () => {
    expect(
      getCallDeviceErrorMessage(
        domError('NotAllowedError', 'Permission denied'),
        Track.Source.ScreenShare,
      ),
    ).toBeNull();
  });

  it('names the device the user was denied', () => {
    expect(
      getCallDeviceErrorMessage(
        domError('NotAllowedError'),
        Track.Source.Microphone,
      ),
    ).toMatch(/microphone was denied/);
    expect(
      getCallDeviceErrorMessage(
        domError('NotAllowedError'),
        Track.Source.Camera,
      ),
    ).toMatch(/camera was denied/);
  });

  it('says when no device is found', () => {
    expect(
      getCallDeviceErrorMessage(domError('NotFoundError'), Track.Source.Camera),
    ).toBe('No camera was found.');
    expect(
      getCallDeviceErrorMessage(
        domError('NotFoundError'),
        Track.Source.Microphone,
      ),
    ).toBe('No microphone was found.');
  });

  it('falls back to a generic message for unknown failures', () => {
    expect(
      getCallDeviceErrorMessage(new Error('boom'), Track.Source.ScreenShare),
    ).toBe('Could not share your screen.');
    expect(
      getCallDeviceErrorMessage(new Error('boom'), Track.Source.Camera),
    ).toBe('Could not turn on the camera.');
  });
});
