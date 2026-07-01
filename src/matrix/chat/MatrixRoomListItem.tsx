import {
  BellSlashIcon,
  FileIcon,
  ImageIcon,
  MicrophoneIcon,
  PhoneIcon,
  SpeakerHighIcon,
  VideoCameraIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import Avatar from '@/core/Avatar';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import { RoomCallState } from './call/useAllRoomCallStates';
import { getChatAvatarColor } from './chatColors';
import { PreviewKind } from './previewClassifier';
import { formatRelativeTime } from './utils';

interface MatrixRoomListItemProps {
  uuid: string;
  name: string;
  scopeName?: string;
  preview?: string;
  /** Structured kind of the last event, driving icon/filename/size rendering. */
  previewKind?: PreviewKind;
  previewFileName?: string;
  previewFileSize?: number;
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

const FILE_ICONS: Partial<Record<PreviewKind, ReactNode>> = {
  image: <ImageIcon size={16} weight="regular" />,
  video: <VideoCameraIcon size={16} weight="regular" />,
  audio: <SpeakerHighIcon size={16} weight="regular" />,
  file: <FileIcon size={16} weight="regular" />,
};

/**
 * Render the preview line for a room row. File/media events render as a card
 * (boxed icon, filename, size below); voice notes show a mic icon and a generic
 * label; system events render their sentence as-is; text shows an optional
 * "Sender: " prefix followed by the message.
 */
const PreviewLine: FC<{
  kind: PreviewKind;
  preview?: string;
  fileName?: string;
  fileSize?: number;
  sender?: string;
}> = ({ kind, preview, fileName, fileSize, sender }) => {
  if (kind === 'voice') {
    return (
      <span className="tc-row-preview-media">
        <MicrophoneIcon size={16} weight="regular" />
        <span className="tc-row-preview-name">
          {sender && <b>{sender}: </b>}
          {translate('Voice message')}
        </span>
      </span>
    );
  }

  const fileIcon = FILE_ICONS[kind];
  if (fileIcon) {
    return (
      <span className="tc-row-file">
        <span className="tc-row-file-icon">{fileIcon}</span>
        <span className="tc-row-file-meta">
          <span className="tc-row-file-name">
            {sender && <b>{sender}: </b>}
            {fileName || preview}
          </span>
          {fileSize != null && (
            <span className="tc-row-file-size">
              {formatFilesize(fileSize, 'B')}
            </span>
          )}
        </span>
      </span>
    );
  }

  if (kind === 'system') {
    return <>{preview}</>;
  }

  return (
    <>
      {sender && <b>{sender}: </b>}
      {preview}
    </>
  );
};

export const MatrixRoomListItem: FC<MatrixRoomListItemProps> = ({
  uuid,
  name,
  scopeName,
  preview,
  previewKind = 'text',
  previewFileName,
  previewFileSize,
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

  // Media/voice/system events are renderable previews even when the message body
  // is empty (the icon + filename carry the meaning); only text/none with an
  // empty body falls back to the scope-name/members line.
  const showPreview =
    Boolean(preview) ||
    previewKind === 'voice' ||
    previewKind === 'image' ||
    previewKind === 'video' ||
    previewKind === 'audio' ||
    previewKind === 'file';

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
      <div className="tc-row-avatar">
        <Avatar
          name={name}
          size={48}
          circle
          labelClassName={`bg-light-${color} text-${color}`}
        />
      </div>
      <div className="tc-row-meta">
        <div className="tc-row-top">
          <span className="tc-row-title">{name}</span>
          {lastActivity > 0 && (
            <span className="tc-row-time">
              {formatRelativeTime(lastActivity)}
            </span>
          )}
        </div>
        <div className="tc-row-bottom">
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
            ) : showPreview ? (
              <PreviewLine
                kind={previewKind}
                preview={preview}
                fileName={previewFileName}
                fileSize={previewFileSize}
                sender={previewSender}
              />
            ) : (
              fallback
            )}
          </div>
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
      </div>
    </button>
  );
};
