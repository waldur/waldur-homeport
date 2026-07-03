import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { FC, useEffect, useRef, useState } from 'react';

import { translate } from '@/i18n';

interface VoiceMessagePlayerProps {
  /** Authenticated http/blob URL resolved by the message item. */
  src: string;
  /** MSC1767 amplitudes (integers 0..1024). May be empty for a flat bar set. */
  waveform?: number[];
  /** Clip length in ms, used for the duration label and progress fallback. */
  durationMs?: number;
}

const MAX_WAVEFORM_VALUE = 1024;
// Render a fixed bar count so the player has a stable width regardless of how
// many samples the sender encoded; we sample the source waveform into buckets.
const RENDERED_BARS = 40;

/** mm:ss for a millisecond duration; clamps negatives to 0. */
function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Resample the source amplitudes to a fixed bar count by averaging buckets, so
 * a 48-sample clip and a 100-sample clip both render the same number of bars.
 * Empty input yields a flat low baseline so the control still reads as audio.
 */
export function resampleBars(waveform: number[] | undefined): number[] {
  if (!waveform || waveform.length === 0) {
    return new Array(RENDERED_BARS).fill(MAX_WAVEFORM_VALUE * 0.15);
  }
  if (waveform.length === RENDERED_BARS) return waveform;

  // Fewer source samples than bars: linear-interpolate so the bars form a smooth
  // curve instead of repeated plateaus.
  if (waveform.length < RENDERED_BARS) {
    const last = waveform.length - 1;
    return Array.from({ length: RENDERED_BARS }, (_, i) => {
      const pos = last === 0 ? 0 : (i * last) / (RENDERED_BARS - 1);
      const lo = Math.floor(pos);
      const hi = Math.ceil(pos);
      return waveform[lo] + (waveform[hi] - waveform[lo]) * (pos - lo);
    });
  }

  // More source samples than bars: average each bucket (down-sample).
  const bucket = waveform.length / RENDERED_BARS;
  return Array.from({ length: RENDERED_BARS }, (_, i) => {
    const start = Math.floor(i * bucket);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < waveform.length; j++) {
      sum += waveform[j];
      count++;
    }
    return count > 0 ? sum / count : 0;
  });
}

export const VoiceMessagePlayer: FC<VoiceMessagePlayerProps> = ({
  src,
  waveform,
  durationMs,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  // Prefer the live element duration once known; the MSC1767 duration can be
  // slightly off (or zero on a failed decode at record time).
  const [audioDurationMs, setAudioDurationMs] = useState<number | null>(null);
  // True while forcing a duration scan on a header-less webm (see onLoaded);
  // suppresses the bogus timeupdate the scan emits so the bars don't flash.
  const fixingDurationRef = useRef(false);

  const bars = resampleBars(waveform);

  const effectiveDuration =
    audioDurationMs && Number.isFinite(audioDurationMs)
      ? audioDurationMs
      : (durationMs ?? 0);

  // The bar count played so far drives the filled/unfilled split. Falls back to
  // 0 progress when the duration is unknown so nothing renders as fully played.
  const playedBars =
    effectiveDuration > 0
      ? Math.round((currentMs / effectiveDuration) * bars.length)
      : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (fixingDurationRef.current) return;
      setCurrentMs(audio.currentTime * 1000);
    };
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setAudioDurationMs(audio.duration * 1000);
        return;
      }
      // MediaRecorder webm carries no duration in the container, so Chrome
      // reports Infinity and the FIRST play() yields no audio until the stream
      // is scanned. Seek past the end once to force that scan: it fills in a
      // real duration and makes the first playback audible.
      fixingDurationRef.current = true;
      const onScan = () => {
        audio.removeEventListener('timeupdate', onScan);
        audio.currentTime = 0;
        fixingDurationRef.current = false;
        if (Number.isFinite(audio.duration)) {
          setAudioDurationMs(audio.duration * 1000);
        }
      };
      audio.addEventListener('timeupdate', onScan);
      // currentTime rejects Infinity; a very large finite value clamps to the
      // real end and triggers the scan.
      audio.currentTime = 1e101;
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrentMs(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => setPlaying(false));
    }
  };

  // While playing show the elapsed time counting up; at rest show total length.
  const label = playing
    ? formatClock(currentMs)
    : formatClock(effectiveDuration);

  return (
    <div className="tc-voice">
      {/* Lifecycle is driven by the play/pause button; no visible controls. */}
      {/* preload="auto" decodes the (already in-memory) blob ahead of the
          click. With "metadata", the first play() of a finite-duration note
          races the decoder — the bars advance but no samples are decoded yet,
          giving a silent first play. The Infinity-duration webm case is fixed
          separately by the duration scan in onLoaded. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="auto" />
      <button
        type="button"
        className="tc-voice__play"
        onClick={toggle}
        aria-label={playing ? translate('Pause') : translate('Play')}
      >
        {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
      </button>
      <div className="tc-voice__bars" aria-hidden="true">
        {bars.map((value, i) => (
          <span
            key={i}
            className={
              i < playedBars ? 'tc-voice__bar is-played' : 'tc-voice__bar'
            }
            style={{
              height: `${Math.max(10, (value / MAX_WAVEFORM_VALUE) * 100)}%`,
            }}
          />
        ))}
      </div>
      <span className="tc-voice__time">{label}</span>
    </div>
  );
};
