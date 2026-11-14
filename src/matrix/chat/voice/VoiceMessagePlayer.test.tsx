import { act, render, screen } from '@testing-library/react';
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
    render(
      <VoiceMessagePlayer
        src="blob:mock"
        waveform={[0, 512, 1024, 256]}
        durationMs={28_000}
      />,
    );

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    // 28s formats as mm:ss.
    expect(screen.getByText('00:28')).toBeInTheDocument();
    expect(screen.getAllByTestId('voice-bar').length).toBeGreaterThan(0);
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
    render(<VoiceMessagePlayer src="blob:mock" durationMs={1000} />);
    expect(screen.getAllByTestId('voice-bar').length).toBeGreaterThan(0);
  });

  describe('visual styling & classes', () => {
    it('applies expected Tailwind classes to player layout, controls and waveform bars', () => {
      render(
        <VoiceMessagePlayer
          src="blob:mock"
          waveform={[0, 512, 1024, 256]}
          durationMs={28_000}
        />,
      );

      const player = screen.getByTestId('voice-message-player');
      expect(player).toHaveClass(
        'flex',
        'items-center',
        'gap-2.5',
        'min-w-[180px]',
      );

      const button = screen.getByRole('button', { name: 'Play' });
      expect(button).toHaveClass(
        'shrink-0',
        'size-8',
        'grid',
        'place-items-center',
        'p-0',
        'border-0',
        'rounded-full',
        'bg-brand-solid',
        'text-white',
        'cursor-pointer',
        'hover:bg-[var(--btn-primary-bg-hover)]',
      );

      const barsContainer = screen.getByTestId('voice-player-bars');
      expect(barsContainer).toHaveClass(
        'flex-1',
        'min-w-0',
        'overflow-hidden',
        'flex',
        'items-center',
        'gap-0.5',
        'h-7',
      );

      const bars = screen.getAllByTestId('voice-bar');
      expect(bars[0]).toHaveClass(
        'flex-1',
        'min-w-[2px]',
        'rounded-full',
        'transition-colors',
        'duration-100',
        'bg-[var(--border-primary)]',
      );

      const duration = screen.getByText('00:28');
      expect(duration).toHaveClass(
        'shrink-0',
        'text-xs',
        'text-secondary',
        'tabular-nums',
      );
    });

    it('applies played background color to played bars during playback', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <VoiceMessagePlayer
          src="blob:mock"
          waveform={[100, 200, 300, 400]}
          durationMs={10_000}
        />,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const audio = container.querySelector('audio');
      expect(audio).not.toBeNull();

      // Start playback
      await user.click(screen.getByRole('button', { name: 'Play' }));

      // Advance currentTime to 5s (50% progress)
      Object.defineProperty(audio, 'currentTime', {
        value: 5,
        configurable: true,
        writable: true,
      });
      act(() => {
        audio?.dispatchEvent(new Event('timeupdate'));
      });

      const bars = screen.getAllByTestId('voice-bar');
      expect(bars[0]).toHaveClass('bg-brand-solid');
      expect(bars[bars.length - 1]).toHaveClass('bg-[var(--border-primary)]');
    });
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
