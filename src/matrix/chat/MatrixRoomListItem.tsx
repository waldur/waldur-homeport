import {
  BellSlashIcon,
  FileIcon,
  ImageIcon,
  MicrophoneIcon,
  PhoneIcon,
  SpeakerHighIcon,
  VideoCameraIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { Avatar, Badge, cn } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import { RoomCallState } from './call/useAllRoomCallStates';
import { getChatAvatarClass } from './chatColors';
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
      <span className="flex items-center gap-1.5 min-w-0">
        <MicrophoneIcon size={16} weight="regular" className="shrink-0" />
        <span className="truncate">
          {sender && <b>{sender}: </b>}
          {translate('Voice message')}
        </span>
      </span>
    );
  }

  const fileIcon = FILE_ICONS[kind];
  if (fileIcon) {
    return (
      <span className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 flex items-center justify-center size-8 border border-secondary rounded-lg text-tertiary">
          {fileIcon}
        </span>
        <span className="min-w-0 flex flex-col">
          <span className="truncate font-medium text-secondary">
            {sender && <b>{sender}: </b>}
            {fileName || preview}
          </span>
          {fileSize != null && (
            <span className="text-quaternary">
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
      className={cn(
        'grid grid-cols-[48px_1fr] gap-3 w-full items-center py-3 px-[var(--card-padding-x,24px)] border-0 bg-transparent text-start transition-colors cursor-pointer hover:bg-secondary',
        active && 'bg-secondary',
      )}
      onClick={onClick}
    >
      <div className="place-self-center size-12">
        <Avatar
          name={name}
          size={48}
          fallbackClassName={getChatAvatarClass(uuid)}
        />
      </div>
      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'grow min-w-0 truncate text-sm leading-[1.4]',
              isUnread
                ? 'text-primary font-semibold'
                : 'text-secondary font-medium',
            )}
          >
            {name}
          </span>
          {lastActivity > 0 && (
            <span className="shrink-0 text-xs text-quaternary tabular-nums">
              {formatRelativeTime(lastActivity)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'grow min-w-0 truncate text-sm leading-[1.4]',
              isUnread ? 'text-primary' : 'text-quaternary',
            )}
          >
            {activeCall ? (
              <span className="text-success inline-flex items-center gap-1">
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
            <BellSlashIcon
              size={14}
              weight="bold"
              className="shrink-0 text-quinary"
            />
          ) : isUnread ? (
            <Badge
              variant={mentionCount > 0 ? 'danger' : 'primary'}
              size="sm"
              className="min-w-6 shrink-0 tabular-nums"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
};
