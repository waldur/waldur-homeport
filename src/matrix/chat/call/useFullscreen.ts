import { RefObject, useCallback, useEffect, useState } from 'react';

import { getFullscreenElement } from '@/core/fullscreen';

// Set the instant fullscreen is requested — BEFORE the async requestFullscreen
// resolves and sets document.fullscreenElement — so the call host and dock slot
// stop relocating the call during that window. Without it, entering fullscreen
// from the docked drawer detaches the call into the floating widget instead.
let fullscreenIntent = false;

export function isCallFullscreenActive(): boolean {
  return fullscreenIntent || getFullscreenElement() !== null;
}

function requestFullscreen(el: HTMLElement): Promise<void> {
  if (el.requestFullscreen) return el.requestFullscreen();
  if ((el as any).webkitRequestFullscreen)
    return (el as any).webkitRequestFullscreen();
  return Promise.reject(new Error('Fullscreen API unavailable'));
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  }
}

interface UseFullscreen {
  isFullscreen: boolean;
  supported: boolean;
  toggle: () => void;
}

/**
 * Toggle the browser Fullscreen API on a target element and track whether that
 * element is the one currently fullscreened. Tracking the specific element (not
 * just "something is fullscreen") keeps the button in sync when the user exits
 * via Esc or fullscreens a different element.
 */
export function useFullscreen(ref: RefObject<HTMLElement>): UseFullscreen {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const active = getFullscreenElement() === ref.current;
      setIsFullscreen(active);
      if (!active) fullscreenIntent = false;
    };
    sync();
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
      fullscreenIntent = false;
    };
  }, [ref]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (getFullscreenElement() === el) {
      exitFullscreen();
      return;
    }
    // Synchronous: freeze relocation before requestFullscreen's promise settles.
    fullscreenIntent = true;
    requestFullscreen(el).catch(() => {
      fullscreenIntent = false;
    });
  }, [ref]);

  const supported =
    typeof document !== 'undefined' &&
    Boolean(
      document.fullscreenEnabled || (document as any).webkitFullscreenEnabled,
    );

  return { isFullscreen, supported, toggle };
}
