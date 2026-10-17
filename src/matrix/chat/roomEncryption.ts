// Mirrors how matrix-js-sdk decides to encrypt the event itself: the state
// event, or the crypto store's memory of it, which a homeserver that drops or
// resets the state event cannot erase.
export const isRoomEncrypted = async (
  client: any,
  room: any,
  roomId: string,
): Promise<boolean> =>
  Boolean(room?.hasEncryptionStateEvent?.()) ||
  Boolean(await client.getCrypto?.()?.isEncryptionEnabledInRoom(roomId));
