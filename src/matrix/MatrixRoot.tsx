import { FunctionComponent, lazy, PropsWithChildren } from 'react';

import { isMatrixChatEnabled } from '@/matrix/utils';

// Gate the Matrix provider chain only on the feature flag plus the
// MATRIX_ENABLED backend switch - both resolve synchronously from config that's
// loaded before the app renders, so this branch is stable across the app's
// lifetime. Tenants where either is off skip the chat client, providers, and
// room subscription; consumers degrade to no-op defaults.
//
// The chain is a lazy chunk: it is the only static path to matrix-js-sdk and
// livekit, and the flag decides at render time whether that chunk is fetched
// at all. While it loads, the suspension surfaces at Application's own
// Suspense boundary, i.e. the same loading screen the config fetch uses.
const MatrixProviders = lazy(() => import('./MatrixProviders'));

export const MatrixRoot: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  if (!isMatrixChatEnabled()) {
    return <>{children}</>;
  }
  return <MatrixProviders>{children}</MatrixProviders>;
};
