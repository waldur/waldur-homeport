import {
  useRemoteParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react';
import { RoomEvent } from 'livekit-client';
import { FC, useEffect, useReducer } from 'react';

import { translate } from '@/i18n';

/**
 * Names the participants of an encrypted call whose media arrives in clear,
 * such as from a client without end-to-end encryption. It is not shown: in
 * clear, it could as well come from the call server as from them.
 */
export const CallEncryptionNotice: FC<{
  identityMap: Map<string, string>;
}> = ({ identityMap }) => {
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    room.on(RoomEvent.ParticipantEncryptionStatusChanged, refresh);
    room.on(RoomEvent.TrackPublished, refresh);
    return () => {
      room.off(RoomEvent.ParticipantEncryptionStatusChanged, refresh);
      room.off(RoomEvent.TrackPublished, refresh);
    };
  }, [room]);

  const inClear = participants.filter(
    (p) => p.trackPublications.size > 0 && !p.isEncrypted,
  );
  if (!inClear.length) return null;
  const names = inClear.map(
    (p) => identityMap.get(p.identity) || p.name || p.identity,
  );
  return (
    <div className="matrix-call-view__notice" role="status">
      <WarningIcon size={16} weight="bold" />
      <span>
        {translate('Not shown, not end-to-end encrypted: {names}', {
          names: names.join(', '),
        })}
      </span>
    </div>
  );
};
