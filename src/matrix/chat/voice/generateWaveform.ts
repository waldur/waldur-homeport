/**
 * Splits PCM into `bars` equal buckets, computes RMS per bucket,
 * then normalizes so the loudest bar = 1.0. When input is silent
 * (all zeros) every bar stays 0 rather than producing NaN.
 */
function downsampleToBars(pcm: Float32Array, bars: number): number[] {
  const bucketSize = Math.max(1, Math.floor(pcm.length / bars));

  const rms = Array.from({ length: bars }, (_, i) => {
    let sumSq = 0;
    let count = 0;
    const start = i * bucketSize;
    // Last bucket absorbs any remainder so we always get `bars` values.
    const end = i === bars - 1 ? pcm.length : start + bucketSize;

    for (let j = start; j < end && j < pcm.length; j++) {
      sumSq += pcm[j] * pcm[j];
      count++;
    }

    return count > 0 ? Math.sqrt(sumSq / count) : 0;
  });

  const maxRms = Math.max(...rms);

  // Guard against divide-by-zero on all-zero input.
  if (maxRms === 0) return new Array(bars).fill(0);

  return rms.map((v) => v / maxRms);
}

/**
 * Decodes a Blob as audio, extracts channel 0, and returns per-bar amplitudes
 * plus the clip duration. Falls back to silent bars on any decode error.
 */
export async function generateWaveform(
  blob: Blob,
  bars = 48,
): Promise<{ waveform: number[]; durationMs: number }> {
  const ctx = new AudioContext();

  try {
    const buffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(buffer);
    const pcm = audioBuffer.getChannelData(0);
    const waveform = downsampleToBars(pcm, bars);
    const durationMs = Math.round(audioBuffer.duration * 1000);
    return { waveform, durationMs };
  } catch {
    return { waveform: new Array(bars).fill(0), durationMs: 0 };
  } finally {
    await ctx.close();
  }
}
