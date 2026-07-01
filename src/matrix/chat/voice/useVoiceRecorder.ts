import { useCallback, useEffect, useRef, useState } from 'react';

type VoiceRecorderState = 'idle' | 'recording';

interface VoiceRecordResult {
  blob: Blob;
  durationMs: number;
}

export interface VoiceRecorderHandle {
  state: VoiceRecorderState;
  elapsedMs: number;
  supported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<VoiceRecordResult | null>;
  cancel: () => void;
}

const PREFERRED_MIME = 'audio/webm;codecs=opus';

export function useVoiceRecorder(): VoiceRecorderHandle {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  // Interval id for elapsed ticker — kept in a ref so cancel() can clear it
  // without triggering a re-render.
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Resolver stored so stop() can await the onstop event asynchronously.
  const stopResolveRef = useRef<((result: VoiceRecordResult) => void) | null>(
    null,
  );

  const supported =
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia;

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearTicker = () => {
    if (tickerRef.current !== null) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  };

  const start = useCallback(async () => {
    if (state === 'recording') return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    // Prefer opus in webm; fall back to browser default if unsupported.
    const mimeType = MediaRecorder.isTypeSupported(PREFERRED_MIME)
      ? PREFERRED_MIME
      : '';

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      const durationMs = Date.now() - startTimeRef.current;
      stopResolveRef.current?.({ blob, durationMs });
      stopResolveRef.current = null;
    };

    recorder.start();

    setElapsedMs(0);
    setState('recording');

    // Drive the elapsed counter every 100 ms; fine-grained enough for a
    // live timer display without burning unnecessary renders.
    tickerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
  }, [state]);

  const stop = useCallback(async (): Promise<VoiceRecordResult | null> => {
    const recorder = recorderRef.current;
    if (!recorder || state !== 'recording') return null;

    clearTicker();

    // If the recorder already went inactive (mic error, track ended), assemble
    // the chunks directly instead of awaiting an `onstop` that will never fire —
    // which would otherwise wedge the caller's "Sending…" state forever.
    const result =
      recorder.state === 'recording'
        ? await new Promise<VoiceRecordResult>((resolve) => {
            stopResolveRef.current = resolve;
            recorder.stop();
          })
        : {
            blob: new Blob(chunksRef.current, {
              type: recorder.mimeType || 'audio/webm',
            }),
            durationMs: Date.now() - startTimeRef.current,
          };

    stopTracks();
    recorderRef.current = null;
    setState('idle');
    setElapsedMs(0);

    return result;
  }, [state]);

  const cancel = useCallback(() => {
    if (!recorderRef.current) return;

    clearTicker();

    // Null the resolver so onstop delivers nothing.
    stopResolveRef.current = null;
    recorderRef.current.ondataavailable = null;
    recorderRef.current.onstop = null;
    // Guard against an already-inactive recorder (mic track ended, permission
    // revoked): stop() throws InvalidStateError in that state, which would
    // abort the caller (e.g. a room switch that funnels through cancel()).
    if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    recorderRef.current = null;

    stopTracks();
    chunksRef.current = [];
    setState('idle');
    setElapsedMs(0);
  }, []);

  // Stop the mic and ticker if the hook unmounts mid-recording — e.g. the
  // drawer closes or the room switches while still recording. Without this the
  // getUserMedia track stays live (the OS mic indicator stays on) and the
  // elapsed-time interval keeps firing on an unmounted hook.
  useEffect(() => {
    return () => {
      if (tickerRef.current !== null) clearInterval(tickerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (recorder.state !== 'inactive') recorder.stop();
      }
    };
  }, []);

  return { state, elapsedMs, supported, start, stop, cancel };
}
