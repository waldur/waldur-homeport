import { ChecksIcon, FileIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { FC, Fragment, useMemo } from 'react';

import Avatar from '@/core/Avatar';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import { getChatAvatarColor } from './chatColors';
import { MatrixMessageActions } from './MatrixMessageActions';
import { useMatrixMessageActions } from './MatrixMessageActionsContext';
import { MatrixMessageEditor } from './MatrixMessageEditor';
import { MatrixReplyQuote } from './MatrixReplyQuote';
import { MessageReactionChips } from './MessageReactionChips';
import { MessageReactionToolbar } from './MessageReactionToolbar';
import { MatrixChatMessage } from './types';
import {
  MEDIA_UNAVAILABLE,
  MEDIA_UNVERIFIED,
  useAuthenticatedMediaUrl,
} from './useAuthenticatedMediaUrl';
import {
  formatTime,
  hasMedia,
  sanitizeName,
  UNDECRYPTABLE_MESSAGE_TYPE,
} from './utils';
import { VoiceMessagePlayer } from './voice/VoiceMessagePlayer';

const MARKDOWN_OVERRIDES = {
  a: {
    props: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  },
};

// disableParsingRawHTML: message bodies are attacker-controlled, and
// markdown-to-jsx renders raw HTML (e.g. <iframe srcdoc>) by default.
const MARKDOWN_BLOCK_OPTIONS = {
  disableParsingRawHTML: true,
  overrides: MARKDOWN_OVERRIDES,
};
const MARKDOWN_INLINE_OPTIONS = {
  forceInline: true,
  disableParsingRawHTML: true,
  overrides: MARKDOWN_OVERRIDES,
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface MentionMatch {
  userId: string;
  name: string;
  isSelf: boolean;
}

/**
 * Split `body` into alternating text / mention segments. Mentions are matched
 * by display name to avoid trusting client-rendered links, and longest names
 * are tried first.
 */
function splitBodyAroundMentions(
  body: string,
  mentions: MentionMatch[],
): Array<
  { type: 'text'; value: string } | { type: 'mention'; match: MentionMatch }
> {
  if (!mentions.length) return [{ type: 'text', value: body }];

  const sorted = [...mentions].sort((a, b) => b.name.length - a.name.length);
  const pattern = new RegExp(
    `@(${sorted.map((m) => escapeRegExp(m.name)).join('|')})`,
    'g',
  );

  const out: ReturnType<typeof splitBodyAroundMentions> = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) {
    if (match.index > cursor) {
      out.push({ type: 'text', value: body.slice(cursor, match.index) });
    }
    const found = sorted.find((m) => m.name === match![1])!;
    out.push({ type: 'mention', match: found });
    cursor = match.index + match[0].length;
  }
  if (cursor < body.length) {
    out.push({ type: 'text', value: body.slice(cursor) });
  }
  return out;
}

const TextBody: FC<{
  body: string;
  mentionedUserIds?: string[];
  memberNames?: Map<string, string>;
  currentUserId?: string | null;
}> = ({ body, mentionedUserIds, memberNames, currentUserId }) => {
  const segments = useMemo(() => {
    if (!mentionedUserIds?.length || !memberNames) return null;
    // Pillify only mentions whose target has a Waldur full name. Matrix
    // shortname or localpart fallbacks (e.g. `@hendrik`) are left as plain
    // text — the canonical tag in Waldur is always the full name.
    const mentions: MentionMatch[] = mentionedUserIds
      .map((userId) => ({
        userId,
        name: memberNames.get(userId) ?? '',
        isSelf: userId === currentUserId,
      }))
      .filter((m) => m.name);
    if (!mentions.length) return null;
    const split = splitBodyAroundMentions(body, mentions);
    return split.some((s) => s.type === 'mention') ? split : null;
  }, [body, mentionedUserIds, memberNames, currentUserId]);

  if (!segments) {
    return (
      <div className="tc-msg-text">
        <Markdown options={MARKDOWN_BLOCK_OPTIONS}>{body}</Markdown>
      </div>
    );
  }

  return (
    <div className="tc-msg-text">
      {segments.map((segment, i) =>
        segment.type === 'mention' ? (
          <span
            key={i}
            className={classNames('tc-mention-tag', {
              'is-self': segment.match.isSelf,
            })}
          >
            @{segment.match.name}
          </span>
        ) : (
          <Fragment key={i}>
            <Markdown options={MARKDOWN_INLINE_OPTIONS}>
              {segment.value}
            </Markdown>
          </Fragment>
        ),
      )}
    </div>
  );
};

interface MatrixMessageItemProps {
  message: MatrixChatMessage;
  isOwn: boolean;
  senderName: string;
  /** Live Waldur profile image URL for the sender; falls back to initials. */
  senderImage?: string;
  continuation?: boolean;
  memberNames?: Map<string, string>;
  currentUserId?: string | null;
  /** The message this one replies to, when it is in the loaded timeline. */
  replyParent?: MatrixChatMessage;
}

const MediaContent: FC<{
  message: MatrixChatMessage;
  memberNames?: Map<string, string>;
  currentUserId?: string | null;
}> = ({ message, memberNames, currentUserId }) => {
  const httpUrl = useAuthenticatedMediaUrl(message);

  if (message.type === UNDECRYPTABLE_MESSAGE_TYPE) {
    return <em className="text-muted">{message.body}</em>;
  }

  if (!hasMedia(message)) {
    return (
      <TextBody
        body={message.body}
        mentionedUserIds={message.mentionedUserIds}
        memberNames={memberNames}
        currentUserId={currentUserId}
      />
    );
  }

  if (!httpUrl) {
    // Still loading the blob
    return (
      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
        Loading {message.body}...
      </div>
    );
  }

  if (httpUrl === MEDIA_UNVERIFIED) {
    return (
      <div className="text-danger" style={{ fontSize: '0.8rem' }}>
        {translate('This attachment could not be decrypted.')} ({message.body})
      </div>
    );
  }

  if (httpUrl === MEDIA_UNAVAILABLE) {
    return (
      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
        {translate('Attachment unavailable')} ({message.body})
      </div>
    );
  }

  switch (message.type) {
    case 'm.image':
    case 'm.sticker':
      return (
        <a href={httpUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={httpUrl}
            alt={message.body}
            style={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 4,
              display: 'block',
            }}
          />
        </a>
      );
    case 'm.video':
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          controls
          style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4 }}
        >
          <source src={httpUrl} type={message.info?.mimetype} />
          {message.body}
        </video>
      );
    case 'm.audio':
      // Voice notes (MSC3245) — and any m.audio carrying an MSC1767 waveform —
      // render the waveform player; everything else falls back to native audio.
      if (message.isVoice || (message.waveform?.length ?? 0) > 0) {
        return (
          <VoiceMessagePlayer
            src={httpUrl}
            waveform={message.waveform}
            durationMs={message.durationMs}
          />
        );
      }
      return (
        <div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls style={{ maxWidth: '100%' }}>
            <source src={httpUrl} type={message.info?.mimetype} />
          </audio>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {message.body}
          </div>
        </div>
      );
    case 'm.file':
      return (
        <a
          href={httpUrl}
          download={message.body}
          target="_blank"
          rel="noopener noreferrer"
          className="tc-file-card"
        >
          <span className="tc-file-card__icon">
            <FileIcon weight="regular" />
          </span>
          <span className="tc-file-card__meta">
            <span className="tc-file-card__name">{message.body}</span>
            {message.info?.size && (
              <span className="tc-file-card__size">
                {formatFilesize(message.info.size, 'B')}
              </span>
            )}
          </span>
        </a>
      );
    default:
      return (
        <TextBody
          body={message.body}
          mentionedUserIds={message.mentionedUserIds}
          memberNames={memberNames}
          currentUserId={currentUserId}
        />
      );
  }
};

export const MatrixMessageItem: FC<MatrixMessageItemProps> = ({
  message,
  isOwn,
  senderName,
  senderImage,
  continuation = false,
  memberNames,
  currentUserId,
  replyParent,
}) => {
  const { editingEventId } = useMatrixMessageActions();
  const editing = editingEventId === message.eventId && !message.redacted;
  const cleanName = sanitizeName(senderName);
  // Own messages are right-aligned with no avatar (the design distinguishes them
  // by the green bubble + read receipt), so the avatar column is built lazily for
  // other people's messages only.
  const renderAvatar = () => {
    if (continuation) return <span />;
    const color = getChatAvatarColor(message.sender);
    return (
      <Avatar
        name={cleanName}
        src={senderImage}
        size={40}
        circle
        labelClassName={`bg-light-${color} text-${color}`}
      />
    );
  };
  const mentionsMe =
    !!currentUserId && !!message.mentionedUserIds?.includes(currentUserId);

  return (
    <div
      data-event-id={message.eventId}
      className={classNames('tc-msg', {
        mine: isOwn,
        continuation,
        'mentions-me': mentionsMe,
      })}
    >
      {!isOwn && renderAvatar()}
      <div className="tc-msg-body">
        {!continuation && (
          <div className="tc-msg-who">
            {isOwn ? translate('You') : cleanName}
            <span className="tc-msg-when">{formatTime(message.timestamp)}</span>
            {isOwn && (
              <ChecksIcon
                className="tc-msg-receipt"
                weight="bold"
                aria-label={translate('Sent')}
              />
            )}
          </div>
        )}
        <div
          className={classNames('tc-bubble', {
            'tc-bubble--editing': editing,
            // Image/video render flush — the padded, tinted bubble around a
            // picture reads as a thick frame.
            'tc-bubble--media':
              hasMedia(message) &&
              ['m.image', 'm.sticker', 'm.video'].includes(message.type),
          })}
        >
          {message.replyToEventId && !message.redacted && (
            <MatrixReplyQuote
              parentId={message.replyToEventId}
              parent={replyParent}
              memberNames={memberNames}
              currentUserId={currentUserId}
            />
          )}
          {message.redacted ? (
            <em className="text-muted">{translate('Message deleted')}</em>
          ) : editing ? (
            <MatrixMessageEditor message={message} />
          ) : (
            <MediaContent
              message={message}
              memberNames={memberNames}
              currentUserId={currentUserId}
            />
          )}
          {message.edited && !editing && (
            <span className="tc-msg-edited">{translate('(edited)')}</span>
          )}
          {message.unencrypted && (
            <div className="text-danger small">
              {translate('Not encrypted')}
            </div>
          )}
          {!message.redacted && !editing && (
            <MessageReactionToolbar
              eventId={message.eventId}
              reactions={message.reactions}
            >
              <MatrixMessageActions message={message} />
            </MessageReactionToolbar>
          )}
        </div>
        {!message.redacted && (
          <MessageReactionChips
            eventId={message.eventId}
            reactions={message.reactions}
            reactors={message.reactors ?? {}}
          />
        )}
      </div>
    </div>
  );
};
