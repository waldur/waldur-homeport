import { FunctionComponent, useEffect, useState } from 'react';

import { useBootSplashDismiss } from 'waldur-boot-splash/react';

import { whenFirstPageReady } from '@/navigation/firstPageReady';

/**
 * Keeps the boot splash up until the first page can be shown whole, then
 * fades it out; without it the splash gave way to a blank page and a spinner
 * per code chunk while the first route resolved. If the application unmounts
 * first (it crashed), the splash goes at once so the error shows.
 */
export const BootSplashGate: FunctionComponent = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => whenFirstPageReady(() => setReady(true)), []);
  useBootSplashDismiss(ready);
  return null;
};
