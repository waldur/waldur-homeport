import { FunctionComponent } from 'react';

import { isRealtimeEnabled } from './config';
import { useRealtimeConnection } from './useRealtimeConnection';

const RealtimeConnection: FunctionComponent = () => {
  useRealtimeConnection();
  return null;
};

// Experimental push-driven cache invalidation (see README.md). Gated on the
// marketplace.realtime_updates backend feature flag (false by default), which
// resolves synchronously before first render, so the branch is stable for the
// app's lifetime — same reasoning as MatrixRoot.
// When off (the default), nothing mounts and the app behaves exactly as before.
export const RealtimeRoot: FunctionComponent = () => {
  if (!isRealtimeEnabled()) {
    return null;
  }
  return <RealtimeConnection />;
};
