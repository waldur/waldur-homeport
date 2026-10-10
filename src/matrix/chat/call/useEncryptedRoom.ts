import { RemoteTrackPublication, Room, RoomEvent } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';

// A same-origin module worker: the CSP's script-src 'self' covers it, where
// an inlined blob worker would need worker-src blob:.
import E2EEWorker from './e2eeWorker?worker';
import { pinOwnIdentity } from './keepDecrypting';
import { MatrixKeyProvider, MediaKeySource } from './MatrixKeyProvider';

/**
 * The LiveKit room of an end-to-end encrypted call: frames are encrypted in
 * a worker with the media keys `keySource` exchanges. Encryption is on before
 * the room connects, so no track is ever published in clear, and media that
 * arrives in clear is never played. Undefined until it is ready, and for a
 * call that is not encrypted.
 */
export function useEncryptedRoom(
  encrypted: boolean,
  keySource: MediaKeySource | null,
  localIdentity: string,
  onError: () => void,
): Room | undefined {
  const [room, setRoom] = useState<Room>();
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!encrypted || !keySource) return;
    const keyProvider = new MatrixKeyProvider(localIdentity);
    let worker: Worker | undefined;
    let next: Room;
    try {
      // The worker keeps decrypting every participant (see e2eeWorker.ts),
      // so media that arrives in clear is dropped, never played.
      worker = new E2EEWorker();
      pinOwnIdentity(worker, localIdentity);
      next = new Room({ e2ee: { keyProvider, worker } });
    } catch {
      worker?.terminate();
      onErrorRef.current();
      return;
    }
    // Nor are tracks announced as unencrypted taken at all: they would only
    // fail to decrypt.
    const refuse = (publication: RemoteTrackPublication) => {
      if (!publication.isEncrypted) publication.setSubscribed(false);
    };
    const refuseAll = () =>
      next.remoteParticipants.forEach((participant) =>
        participant.trackPublications.forEach(refuse),
      );
    // The worker sends media only under our own identity; a call server
    // naming us otherwise gets a call that ends rather than silent media.
    const checkIdentity = () => {
      if (next.localParticipant.identity !== localIdentity) {
        onErrorRef.current();
      }
    };
    next
      .on(RoomEvent.SignalConnected, checkIdentity)
      // A full reconnect joins again, and is named again.
      .on(RoomEvent.Reconnected, checkIdentity)
      .on(RoomEvent.TrackPublished, refuse)
      .on(RoomEvent.ParticipantConnected, refuseAll)
      .on(RoomEvent.ConnectionStateChanged, refuseAll);
    keyProvider.setSource(keySource);
    let active = true;
    next.setE2EEEnabled(true).then(
      () => active && setRoom(next),
      () => active && onErrorRef.current(),
    );
    return () => {
      active = false;
      setRoom(undefined);
      keyProvider.setSource(null);
      next
        .off(RoomEvent.SignalConnected, checkIdentity)
        .off(RoomEvent.Reconnected, checkIdentity)
        .off(RoomEvent.TrackPublished, refuse)
        .off(RoomEvent.ParticipantConnected, refuseAll)
        .off(RoomEvent.ConnectionStateChanged, refuseAll);
      void next.disconnect().finally(() => worker?.terminate());
    };
  }, [encrypted, keySource, localIdentity]);

  return encrypted ? room : undefined;
}
