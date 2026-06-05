import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';

import Avatar from '@/core/Avatar';
import { translate } from '@/i18n';

import { getChatAvatarColor } from './chatColors';
import { MessageReactionChips } from './MessageReactionChips';
import { MessageReactionToolbar } from './MessageReactionToolbar';
import { MatrixChatMessage } from './types';
import { useMatrixClient } from './useMatrixClient';
import { formatTime, sanitizeName } from './utils';

/**
 * Fetch media via the Matrix client's authenticated endpoint and return a
 * blob URL that can be used in <img>, <video>, <audio> src attributes.
 *
 * Returns `null` while loading or `MEDIA_UNAVAILABLE` if the fetch failed,
 * so the renderer can surface a placeholder instead of leaking the mxc to
 * an unauthenticated URL that bypasses the access check.
 */
const MEDIA_UNAVAILABLE = '__matrix_media_unavailable__';

function useAuthenticatedMediaUrl(mxcUrl: string | undefined) {
  const { client } = useMatrixClient();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mxcUrl || !client) return;

    let revoked = false;
    const match = mxcUrl.match(/^mxc:\/\/([^/]+)\/(.+)$/);
    if (!match) return;

    const [, serverName, mediaId] = match;
    const baseUrl =
      (client as any).baseUrl || (client as any).getHomeserverUrl?.();
    if (!baseUrl) return;

    const url = `${baseUrl}/_matrix/client/v1/media/download/${encodeURIComponent(serverName)}/${encodeURIComponent(mediaId)}`;
    const accessToken = (client as any).getAccessToken?.();

    fetch(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const created = URL.createObjectURL(blob);
        // A second guard inside the .then is required because the effect can
        // re-run (new mxc/client) between the fetch dispatch and resolve.
        // The cleanup will have set `revoked = true`; revoke the blob we
        // just created before it leaks.
        if (revoked) {
          URL.revokeObjectURL(created);
          return;
        }
        setBlobUrl(created);
      })
      .catch(() => {
        // Do NOT fall back to the legacy unauthenticated /media/v3/download
        // endpoint: it would bypass the homeserver's authenticated media
        // gate and leak the mxc URL through the page's network log.
        if (!revoked) {
          setBlobUrl(MEDIA_UNAVAILABLE);
        }
      });

    return () => {
      revoked = true;
      setBlobUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [mxcUrl, client]);

  return blobUrl;
}

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
  continuation?: boolean;
  memberNames?: Map<string, string>;
  currentUserId?: string | null;
}

const MediaContent: FC<{
  message: MatrixChatMessage;
  memberNames?: Map<string, string>;
  currentUserId?: string | null;
}> = ({ message, memberNames, currentUserId }) => {
  const httpUrl = useAuthenticatedMediaUrl(message.url);

  if (!message.url) {
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
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <i className="fa fa-file-o" />
          <span>{message.body}</span>
          {message.info?.size && (
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              ({(message.info.size / 1024).toFixed(0)} KB)
            </span>
          )}
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
  continuation = false,
  memberNames,
  currentUserId,
}) => {
  const color = getChatAvatarColor(message.sender);
  const cleanName = sanitizeName(senderName);
  const avatar = continuation ? (
    <span />
  ) : (
    <Avatar
      name={cleanName}
      size={32}
      labelClassName={`bg-light-${color} text-${color}`}
    />
  );
  const mentionsMe =
    !!currentUserId && !!message.mentionedUserIds?.includes(currentUserId);

  return (
    <div
      className={classNames('tc-msg', {
        mine: isOwn,
        continuation,
        'mentions-me': mentionsMe,
      })}
    >
      {!isOwn && avatar}
      <div className="tc-msg-body">
        {!continuation && (
          <div className="tc-msg-who">
            {isOwn ? translate('You') : cleanName}
            <span className="tc-msg-when">{formatTime(message.timestamp)}</span>
          </div>
        )}
        <div className="tc-bubble">
          <MediaContent
            message={message}
            memberNames={memberNames}
            currentUserId={currentUserId}
          />
          <MessageReactionToolbar
            eventId={message.eventId}
            reactions={message.reactions}
          />
        </div>
        <MessageReactionChips
          eventId={message.eventId}
          reactions={message.reactions}
          reactors={message.reactors ?? {}}
        />
      </div>
      {isOwn && avatar}
    </div>
  );
};
