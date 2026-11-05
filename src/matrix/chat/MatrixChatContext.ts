import { createContext } from 'react';

import { MatrixChatContextValue } from './types';

// Lives apart from MatrixChatProvider so hooks such as useMatrixClient, which
// header components read on every tenant, do not drag matrix-js-sdk into the
// initial bundle. The provider is only mounted (and its chunk only fetched)
// when Matrix chat is enabled.
export const MatrixChatContext = createContext<MatrixChatContextValue>({
  client: null,
  connectionState: 'idle',
  activeRoomId: null,
  activeRoomUuid: null,
  requestedRoomUuid: null,
  userId: null,
  connect: async () => {},
  disconnect: () => {},
  registerRoomView: () => () => {},
  showRoomHere: async () => {},
  error: null,
  deniedRoomUuids: new Set(),
  failedRoomUuid: null,
  cryptoState: 'off',
  resetCryptoIdentity: async () => {},
  importCryptoRecoveryKey: async () => {},
});
