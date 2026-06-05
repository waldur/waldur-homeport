import { createContext } from 'react';

import { MatrixCallContextValue } from './types';

export const MatrixCallContext = createContext<MatrixCallContextValue>({
  callState: 'idle',
  credentials: null,
  callMembers: [],
  callRoomId: null,
  callRoomUuid: null,
  rtcAvailable: false,
  error: null,
  startCall: async () => {},
  endCall: () => {},
  markConnected: () => {},
});
