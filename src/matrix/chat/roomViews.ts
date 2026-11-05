import { MatrixChatContextValue } from './types';

/**
 * Another chat view has the one active room: the client is connected, and the
 * room asked for last is another one, open or opening. Until the user brings
 * this view's room back with `showRoomHere`, the view has nothing to show.
 */
export const isRoomOpenElsewhere = (
  {
    connectionState,
    activeRoomUuid,
    requestedRoomUuid,
  }: Pick<
    MatrixChatContextValue,
    'connectionState' | 'activeRoomUuid' | 'requestedRoomUuid'
  >,
  roomUuid: string,
) =>
  connectionState === 'connected' &&
  requestedRoomUuid !== null &&
  requestedRoomUuid !== roomUuid &&
  activeRoomUuid !== roomUuid;
