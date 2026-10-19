import { useEffect } from 'react';

import { dismissBootSplash } from './index';

// An unmount's dismissal waits a tick, so StrictMode's dev-only unmount and
// immediate remount of effects does not take the splash down early.
let pendingUnmount: ReturnType<typeof setTimeout> | undefined;

/**
 * Keeps the boot splash up until `ready`, then fades it out. If the component
 * unmounts first (the app crashed above it), the splash goes at once, so an
 * error screen is not left hidden underneath it.
 *
 * Mount it once, high in the tree; what "ready" means is the app's call (a
 * resolved first route, the first data that shapes the page, or simply that
 * the app has mounted).
 */
export function useBootSplashDismiss(ready: boolean) {
  useEffect(() => {
    clearTimeout(pendingUnmount);
    return () => {
      pendingUnmount = setTimeout(() => dismissBootSplash());
    };
  }, []);

  useEffect(() => {
    if (ready) {
      dismissBootSplash({ fade: true });
    }
  }, [ready]);
}
