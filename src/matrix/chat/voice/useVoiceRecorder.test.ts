import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useVoiceRecorder } from './useVoiceRecorder';

const makeFakeTrack = () => ({ stop: vi.fn() });

// Return stable track objects so every getTracks() call (hook's + test's)
// sees the same instances — otherwise post-stop assertions see fresh mocks.
const makeFakeStream = () => {
  const tracks = [makeFakeTrack()];
  return { getTracks: vi.fn(() => tracks) };
};

// The real MediaRecorder fires ondataavailable for each chunk then onstop once
// all chunks are collected. We replicate that minimal sequence in stop().
class FakeMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  static lastInstance: FakeMediaRecorder | null = null;

  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor() {
    FakeMediaRecorder.lastInstance = this;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    // Browser: stopping an already-inactive recorder is a no-op and fires no
    // onstop. Modelling that is what makes the "already inactive" test meaningful.
    if (this.state !== 'recording') return;
    this.state = 'inactive';
    // Deliver one chunk, then signal completion — matches real browser order.
    this.ondataavailable?.({
      data: new Blob(['audio'], { type: 'audio/webm' }),
    });
    this.onstop?.();
  }
}

let originalMediaRecorder: typeof MediaRecorder;
let fakeStream: ReturnType<typeof makeFakeStream>;

beforeEach(() => {
  originalMediaRecorder = (global as any).MediaRecorder;
  (global as any).MediaRecorder = FakeMediaRecorder;

  fakeStream = makeFakeStream();
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn().mockResolvedValue(fakeStream) },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  (global as any).MediaRecorder = originalMediaRecorder;
  vi.restoreAllMocks();
});

describe('useVoiceRecorder', () => {
  // Fake timers needed because the hook drives an elapsed-time interval via
  // setInterval. Without control over the clock the elapsed assertions would
  // be non-deterministic and the interval would leak between tests.
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle state with zero elapsed', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.state).toBe('idle');
    expect(result.current.elapsedMs).toBe(0);
  });

  it('reports supported=true when MediaRecorder and getUserMedia are present', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.supported).toBe(true);
  });

  it('transitions to recording after start()', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toBe('recording');
  });

  it('advances elapsedMs while recording', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(1000);
  });

  it('stop() resolves with a blob and returns to idle', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    let outcome: Awaited<ReturnType<typeof result.current.stop>>;
    await act(async () => {
      outcome = await result.current.stop();
    });

    expect(result.current.state).toBe('idle');
    expect(outcome!).not.toBeNull();
    expect(outcome!.blob).toBeInstanceOf(Blob);
  });

  it('stop() resolves with durationMs matching elapsed time', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    let outcome: Awaited<ReturnType<typeof result.current.stop>>;
    await act(async () => {
      outcome = await result.current.stop();
    });

    expect(outcome!.durationMs).toBeGreaterThanOrEqual(2000);
  });

  it('stop() stops all stream tracks', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    await act(async () => {
      await result.current.stop();
    });

    const tracks = fakeStream.getTracks();
    tracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
  });

  it('stop() returns null when not recording', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    let outcome: Awaited<ReturnType<typeof result.current.stop>>;
    await act(async () => {
      outcome = await result.current.stop();
    });

    expect(outcome!).toBeNull();
  });

  it('cancel() returns to idle without producing a blob', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.cancel();
    });

    expect(result.current.state).toBe('idle');
  });

  it('cancel() stops all stream tracks', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.cancel();
    });

    const tracks = fakeStream.getTracks();
    tracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
  });

  it('stop() resolves without hanging when the recorder already went inactive', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    // Mic track ended mid-recording: the browser flipped the recorder to
    // 'inactive' and will not fire onstop for our stop() call.
    FakeMediaRecorder.lastInstance!.state = 'inactive';

    let outcome: Awaited<ReturnType<typeof result.current.stop>>;
    await act(async () => {
      outcome = await result.current.stop();
    });

    expect(outcome!).not.toBeNull();
    expect(outcome!.blob).toBeInstanceOf(Blob);
    expect(result.current.state).toBe('idle');
  }, 2000);

  it('stops the mic tracks when unmounted mid-recording', async () => {
    const { result, unmount } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    unmount();

    const tracks = fakeStream.getTracks();
    tracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
  });
});
