import { FunctionComponent, useEffect } from 'react';

import { whenFirstPageReady } from '@/navigation/firstPageReady';

const FADE_MS = 200;

/**
 * Removes the boot splash index.html paints (#boot-splash), which stays
 * outside React from the first paint on so it is never replaced or redrawn
 * while the application loads underneath it. With `fade`, it fades out first.
 */
export function dismissBootSplash({ fade = false } = {}) {
  const splash = document.getElementById('boot-splash');
  if (!splash) {
    return;
  }
  if (!fade) {
    splash.remove();
    return;
  }
  if (splash.hasAttribute('data-leaving')) {
    return;
  }
  splash.setAttribute('data-leaving', '');
  // A timer rather than transitionend, which never fires under reduced motion.
  setTimeout(() => splash.remove(), FADE_MS);
}

/**
 * Keeps the boot splash up until the first page can be shown whole, then
 * fades it out; without it the splash gave way to a blank page and a spinner
 * per code chunk while the first route resolved. If the application unmounts
 * first (it crashed), the splash goes at once so the error shows.
 */
export const BootSplashGate: FunctionComponent = () => {
  useEffect(() => {
    const cancel = whenFirstPageReady(() => dismissBootSplash({ fade: true }));
    return () => {
      cancel();
      dismissBootSplash();
    };
  }, []);
  return null;
};
