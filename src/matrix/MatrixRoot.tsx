import { FunctionComponent, PropsWithChildren } from 'react';

import { MatrixCallHost } from '@/matrix/chat/call/MatrixCallHost';
import { MatrixCallPortalProvider } from '@/matrix/chat/call/MatrixCallPortalProvider';
import { MatrixCallProvider } from '@/matrix/chat/call/MatrixCallProvider';
import { MatrixAutoConnect } from '@/matrix/chat/MatrixAutoConnect';
import { MatrixChatProvider } from '@/matrix/chat/MatrixChatProvider';
import { MatrixComposerDraftProvider } from '@/matrix/chat/MatrixComposerDraftContext';
import { isMatrixChatEnabled } from '@/matrix/utils';

// Gate the Matrix provider chain only on the feature flag plus the
// MATRIX_ENABLED backend switch - both resolve synchronously from config that's
// loaded before the app renders, so this branch is stable across the app's
// lifetime. Tenants where either is off skip the chat client, providers, and
// room subscription; consumers degrade to no-op defaults.
export const MatrixRoot: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  if (!isMatrixChatEnabled()) {
    return <>{children}</>;
  }
  return (
    <MatrixChatProvider>
      <MatrixAutoConnect />
      <MatrixCallProvider>
        <MatrixCallPortalProvider>
          <MatrixCallHost />
          <MatrixComposerDraftProvider>{children}</MatrixComposerDraftProvider>
        </MatrixCallPortalProvider>
      </MatrixCallProvider>
    </MatrixChatProvider>
  );
};
