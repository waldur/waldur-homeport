import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VoiceMessagePlayer, resampleBars } from './VoiceMessagePlayer';

// jsdom doesn't implement the media element playback methods; stub them so the
// toggle handler can flip play/pause state via the dispatched events.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('pause'));
  });
});

describe('VoiceMessagePlayer', () => {
  it('renders a play button, waveform bars and the formatted duration', () => {
    const { container } = render(
      <VoiceMessagePlayer
        src="blob:mock"
        waveform={[0, 512, 1024, 256]}
        durationMs={28_000}
      />,
    );

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    // 28s formats as mm:ss.
    expect(screen.getByText('00:28')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.tc-voice__bar').length).toBeGreaterThan(
      0,
    );
  });

  it('toggles the aria-label between Play and Pause when clicked', async () => {
    const user = userEvent.setup();
    render(
      <VoiceMessagePlayer src="blob:mock" waveform={[100]} durationMs={5000} />,
    );

    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('still renders bars when no waveform is provided', () => {
    const { container } = render(
      <VoiceMessagePlayer src="blob:mock" durationMs={1000} />,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.tc-voice__bar').length).toBeGreaterThan(
      0,
    );
  });
});

describe('resampleBars', () => {
  it('upsamples a short waveform into a smooth (non-plateau) curve', () => {
    const bars = resampleBars([0, 1024]);
    expect(bars).toHaveLength(40);
    expect(bars[0]).toBeCloseTo(0);
    expect(bars[39]).toBeCloseTo(1024);
    // Strictly increasing — naive index duplication would repeat values (plateaus).
    for (let i = 1; i < bars.length; i++) {
      expect(bars[i]).toBeGreaterThan(bars[i - 1]);
    }
  });
});
