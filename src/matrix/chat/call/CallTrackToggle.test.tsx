import { render } from '@testing-library/react';
import { Track } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';

import { CallTrackToggle } from './CallTrackToggle';

const trackToggleProps = vi.fn();

vi.mock('@livekit/components-react', () => ({
  TrackToggle: (props: any) => {
    trackToggleProps(props);
    return <button type="button">toggle</button>;
  },
}));

const domError = (name: string, message = '') =>
  Object.assign(new Error(message), { name });

const renderToggle = (
  source: Track.Source.Camera | Track.Source.ScreenShare,
) => {
  render(<CallTrackToggle source={source} label="Toggle" />);
  return trackToggleProps.mock.lastCall[0];
};

describe('CallTrackToggle', () => {
  beforeEach(() => {
    trackToggleProps.mockClear();
    vi.mocked(useNotify().showError).mockClear();
  });

  it('passes onDeviceError to the LiveKit toggle', () => {
    const props = renderToggle(Track.Source.Camera);
    expect(props.source).toBe(Track.Source.Camera);
    expect(props.onDeviceError).toEqual(expect.any(Function));
  });

  it('tells the user when the device fails', () => {
    const props = renderToggle(Track.Source.Camera);
    props.onDeviceError(domError('NotAllowedError'));
    expect(useNotify().showError).toHaveBeenCalledWith(
      expect.stringMatching(/camera was denied/),
    );
  });

  it('stays silent when the screen-share picker is cancelled', () => {
    const props = renderToggle(Track.Source.ScreenShare);
    props.onDeviceError(domError('NotAllowedError', 'Permission denied'));
    expect(useNotify().showError).not.toHaveBeenCalled();
  });
});
