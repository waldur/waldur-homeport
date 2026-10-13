import { PhoneIcon, PhoneSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

import { MatrixChatMessage } from '../types';
import { formatTime, resolveMemberName, sanitizeName } from '../utils';

import { CALL_STARTED_MESSAGE_TYPE } from './callTimeline';

function startLabel(
  message: MatrixChatMessage,
  senderName: string,
  memberNames: Map<string, string>,
  currentUserId: string | null,
): string {
  const participants = message.callParticipants ?? [];
  if (participants.length > 1) {
    const names = participants.map(({ userId, displayName }) =>
      userId === currentUserId
        ? translate('You')
        : sanitizeName(resolveMemberName(userId, memberNames, displayName)),
    );
    return translate('Group call started: {names}', {
      names: names.join(', '),
    });
  }
  return message.sender === currentUserId
    ? translate('You started a call')
    : translate('{name} started a call', { name: sanitizeName(senderName) });
}

/** Where the room's call started, and who has been on it, or where it ended. */
export const CallTimelineRow: FC<{
  message: MatrixChatMessage;
  senderName: string;
  memberNames: Map<string, string>;
  currentUserId: string | null;
}> = ({ message, senderName, memberNames, currentUserId }) => {
  const started = message.type === CALL_STARTED_MESSAGE_TYPE;
  return (
    <div className="tc-call-event" data-event-id={message.eventId}>
      {started ? (
        <PhoneIcon size={14} weight="bold" />
      ) : (
        <PhoneSlashIcon size={14} weight="bold" />
      )}
      <span>
        {started
          ? startLabel(message, senderName, memberNames, currentUserId)
          : translate('Call ended')}
      </span>
      <span>{formatTime(message.timestamp)}</span>
    </div>
  );
};
