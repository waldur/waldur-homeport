import { FunctionComponent, PropsWithChildren } from 'react';

import { MatrixCallHost } from '@/matrix/chat/call/MatrixCallHost';
import { MatrixCallPortalProvider } from '@/matrix/chat/call/MatrixCallPortalProvider';
import { MatrixCallProvider } from '@/matrix/chat/call/MatrixCallProvider';
import { MatrixAskToasts } from '@/matrix/chat/MatrixAskToasts';
import { MatrixAutoConnect } from '@/matrix/chat/MatrixAutoConnect';
import { MatrixChatProvider } from '@/matrix/chat/MatrixChatProvider';
import { MatrixComposerDraftProvider } from '@/matrix/chat/MatrixComposerDraftContext';
import { MatrixRoomListSync } from '@/matrix/chat/MatrixRoomListSync';
import { MatrixUnreadTitle } from '@/matrix/chat/MatrixUnreadTitle';

// The provider chain for tenants with Matrix chat enabled. Loaded lazily by
// MatrixRoot: this is the only static entry point to matrix-js-sdk, so tenants
// with chat disabled never download it.
const MatrixProviders: FunctionComponent<PropsWithChildren> = ({
  children,
}) => (
  <MatrixChatProvider>
    <MatrixAutoConnect />
    <MatrixAskToasts />
    <MatrixUnreadTitle />
    <MatrixRoomListSync />
    <MatrixCallProvider>
      <MatrixCallPortalProvider>
        <MatrixCallHost />
        <MatrixComposerDraftProvider>{children}</MatrixComposerDraftProvider>
      </MatrixCallPortalProvider>
    </MatrixCallProvider>
  </MatrixChatProvider>
);

export default MatrixProviders;
