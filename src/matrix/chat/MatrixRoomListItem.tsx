import { BellSlashIcon, PhoneIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import Avatar from '@/core/Avatar';
import { translate } from '@/i18n';

import { RoomCallState } from './call/useAllRoomCallStates';
import { getChatAvatarColor } from './chatColors';
import { formatRelativeTime } from './utils';

interface MatrixRoomListItemProps {
  uuid: string;
  name: string;
  scopeName?: string;
  preview?: string;
  previewSender?: string;
  unreadCount: number;
  mentionCount: number;
  isMuted?: boolean;
  membersCount?: number;
  lastActivity: number;
  activeCall: RoomCallState | null;
  active?: boolean;
  onClick: () => void;
}

export const MatrixRoomListItem: FC<MatrixRoomListItemProps> = ({
  uuid,
  name,
  scopeName,
  preview,
  previewSender,
  unreadCount,
  mentionCount,
  isMuted,
  membersCount,
  lastActivity,
  activeCall,
  active,
  onClick,
}) => {
  const isUnread = unreadCount > 0;
  const color = getChatAvatarColor(uuid);

  const fallback =
    scopeName ||
    (membersCount != null
      ? translate('{count} members', { count: membersCount })
      : translate('No messages yet'));

  return (
    <button
      type="button"
      className={classNames('tc-row', { active, unread: isUnread })}
      onClick={onClick}
    >
      <Avatar
        name={name}
        size={32}
        labelClassName={`bg-light-${color} text-${color}`}
      />
      <div className="tc-row-meta">
        <div className="tc-row-name">
          <span className="tc-row-title">{name}</span>
        </div>
        <div className="tc-row-preview">
          {activeCall ? (
            <span className="text-success d-inline-flex align-items-center gap-1">
              <PhoneIcon size={14} weight="fill" />
              {activeCall.participantCount === 1
                ? translate('Call in progress · 1 participant')
                : translate('Call in progress · {count} participants', {
                    count: activeCall.participantCount,
                  })}
            </span>
          ) : preview ? (
            <>
              {previewSender && <b>{previewSender}: </b>}
              {preview}
            </>
          ) : (
            fallback
          )}
        </div>
      </div>
      <div className="tc-row-aside">
        {lastActivity > 0 && (
          <span className="tc-row-time">
            {formatRelativeTime(lastActivity)}
          </span>
        )}
        {isMuted ? (
          <BellSlashIcon size={14} weight="bold" className="tc-row-muted" />
        ) : isUnread ? (
          <span
            className={classNames('tc-badge', { mention: mentionCount > 0 })}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
};
