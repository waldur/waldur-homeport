export interface LiveKitCredentials {
  url: string;
  jwt: string;
}

export type CallState =
  | 'idle'
  | 'discovering'
  | 'connecting'
  | 'connected'
  | 'error';

export interface CallMemberInfo {
  userId: string;
  displayName: string;
  deviceId: string;
  expiresAt: number;
}

export interface MatrixCallContextValue {
  callState: CallState;
  credentials: LiveKitCredentials | null;
  callMembers: CallMemberInfo[];
  /** Matrix room id of the room the active call belongs to, or null when idle. */
  callRoomId: string | null;
  /** Waldur room uuid of the room the active call belongs to, or null when idle. */
  callRoomUuid: string | null;
  rtcAvailable: boolean;
  error: string | null;
  startCall: () => Promise<void>;
  endCall: (errorMessage?: string) => void;
  markConnected: () => void;
}
