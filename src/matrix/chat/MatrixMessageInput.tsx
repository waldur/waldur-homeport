import { PaperPlaneRightIcon, PaperclipIcon } from '@phosphor-icons/react';
import {
  FC,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { translate } from '@/i18n';
import { NotifyService } from '@/store/notify';

import { useMatrixClient } from './useMatrixClient';
import { useRoomMemberNames } from './useRoomMemberNames';
import { resolveMemberName } from './utils';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'];

function getMsgType(mimeType: string) {
  if (IMAGE_TYPES.includes(mimeType)) return 'm.image';
  if (VIDEO_TYPES.includes(mimeType)) return 'm.video';
  if (AUDIO_TYPES.includes(mimeType)) return 'm.audio';
  return 'm.file';
}

interface MentionCandidate {
  userId: string;
  displayName: string;
}

/** Extract the @-mention query from the text at the cursor position. */
function getMentionQuery(
  text: string,
  cursorPos: number,
): { query: string; start: number } | null {
  // Walk backwards from cursor to find the @ trigger. The prefix class
  // accepts whitespace + opening parens/brackets so users can mention
  // mid-sentence (e.g. "(@alice)" / "[@bob]") — common in markdown.
  const before = text.slice(0, cursorPos);
  const match = before.match(/(^|[\s([])@([^\s@]*)$/);
  if (!match) return null;
  const prefix = match[1]; // space or start-of-string before @
  const query = match[2];
  const start = cursorPos - query.length - 1; // position of @
  // If @ is preceded by text (not a space/start), it's an email or similar
  if (start > 0 && prefix === '') return null;
  return { query, start };
}

export const MatrixMessageInput: FC = () => {
  const { client, activeRoomId, activeRoomUuid, connectionState, userId } =
    useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<{
    query: string;
    start: number;
  } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get room members for mention autocomplete
  const members: MentionCandidate[] = useMemo(() => {
    if (!client || !activeRoomId) return [];
    const room = client.getRoom(activeRoomId);
    if (!room) return [];
    return room
      .getJoinedMembers()
      .map((m: any) => ({
        userId: m.userId as string,
        displayName: resolveMemberName(m.userId, memberNames, m.name),
      }))
      .filter((m: MentionCandidate) => m.userId !== userId)
      .sort((a: MentionCandidate, b: MentionCandidate) =>
        a.displayName.localeCompare(b.displayName),
      );
  }, [client, activeRoomId, userId, memberNames]);

  const filteredMentions = useMemo(() => {
    if (!mentionQuery) return [];
    const q = mentionQuery.query.toLowerCase();
    return members
      .filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.userId.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [members, mentionQuery]);

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!client || !activeRoomId || connectionState !== 'connected') return;
      client
        .sendTyping(activeRoomId, isTyping, isTyping ? 5000 : undefined)
        .catch(() => {});
    },
    [client, activeRoomId, connectionState],
  );

  // Cancel any pending typing-stop on room change / unmount so the timer
  // doesn't fire against a stale client+room after the user has moved on.
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      isTypingRef.current = false;
    };
  }, [activeRoomId]);

  const updateMentionState = useCallback((value: string, cursorPos: number) => {
    const mq = getMentionQuery(value, cursorPos);
    setMentionQuery(mq);
    if (mq) {
      setMentionIndex(0);
    }
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      setMessage(value);
      // Update mention state based on cursor position
      const cursorPos = textareaRef.current?.selectionStart ?? value.length;
      updateMentionState(value, cursorPos);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (value.length > 0) {
        if (!isTypingRef.current) {
          isTypingRef.current = true;
          sendTypingIndicator(true);
        }
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          sendTypingIndicator(false);
        }, 5000);
      } else {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          sendTypingIndicator(false);
        }
      }
    },
    [sendTypingIndicator, updateMentionState],
  );

  const acceptMention = useCallback(
    (member: MentionCandidate) => {
      if (!mentionQuery) return;
      const before = message.slice(0, mentionQuery.start);
      const after = message.slice(
        mentionQuery.start + 1 + mentionQuery.query.length,
      );
      const insertText = `@${member.displayName} `;
      const newMessage = before + insertText + after;
      setMessage(newMessage);
      setMentionQuery(null);
      // Focus textarea and place cursor after the mention
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) {
          const pos = before.length + insertText.length;
          ta.focus();
          ta.setSelectionRange(pos, pos);
        }
      });
    },
    [message, mentionQuery],
  );

  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const text = message.trim();
      if (!text || !client || !activeRoomId || sending) return;

      setSending(true);
      isTypingRef.current = false;
      sendTypingIndicator(false);

      try {
        // Build mention pills for Matrix spec (org.matrix.msc3952).
        // Escape first so message text can't inject HTML, then sort members
        // longest-name-first so "@Alice Smith" is matched before "@Alice" and
        // isn't corrupted by the shorter prefix.
        const escapeHtml = (s: string) =>
          s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escapeRegExp = (s: string) =>
          s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const mentionedUserIds: string[] = [];
        let htmlBody = escapeHtml(text);

        const sortedMembers = [...members].sort(
          (a, b) => b.displayName.length - a.displayName.length,
        );
        for (const member of sortedMembers) {
          const mentionText = `@${member.displayName}`;
          if (text.includes(mentionText)) {
            const pattern = new RegExp(
              escapeRegExp(escapeHtml(mentionText)),
              'g',
            );
            const replaced = htmlBody.replace(
              pattern,
              `<a href="https://matrix.to/#/${encodeURIComponent(member.userId)}">${escapeHtml(member.displayName)}</a>`,
            );
            // Only register the user_id mention if the replacement actually
            // fired. Names with characters that escape away (e.g. raw "<")
            // would otherwise be listed in m.mentions without appearing in
            // the body — receivers would silently ping the wrong people.
            if (replaced !== htmlBody) {
              mentionedUserIds.push(member.userId);
              htmlBody = replaced;
            }
          }
        }

        if (mentionedUserIds.length > 0) {
          await client.sendMessage(activeRoomId, {
            msgtype: 'm.text',
            body: text,
            format: 'org.matrix.custom.html',
            formatted_body: htmlBody,
            'm.mentions': { user_ids: mentionedUserIds },
          } as any);
        } else {
          await client.sendTextMessage(activeRoomId, text);
        }
        setMessage('');
      } catch {
        // Message will be retried by the SDK
      } finally {
        setSending(false);
      }
    },
    [message, client, activeRoomId, sending, sendTypingIndicator, members],
  );

  const handleFileSelect = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !client || !activeRoomId) return;

    setUploading(true);
    try {
      const uploadResponse = await (client as any).uploadContent(file, {
        name: file.name,
        type: file.type,
      });
      const mxcUrl =
        typeof uploadResponse === 'string'
          ? uploadResponse
          : uploadResponse?.content_uri;

      if (!mxcUrl) throw new Error('No content_uri in upload response');

      const msgtype = getMsgType(file.type);
      const content: Record<string, any> = {
        msgtype,
        body: file.name,
        url: mxcUrl,
        info: {
          mimetype: file.type,
          size: file.size,
        },
      };

      if (msgtype === 'm.image') {
        const dimensions = await getImageDimensions(file);
        if (dimensions) {
          content.info.w = dimensions.width;
          content.info.h = dimensions.height;
        }
      }

      await client.sendMessage(activeRoomId, content as any);
    } catch {
      // Surface the failure to the user — silently re-enabling the input
      // makes it look like the upload succeeded. Retry remains a TODO.
      NotifyService.error(translate('Upload failed.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [client, activeRoomId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // When mention popup is visible, handle navigation keys
      if (mentionQuery && filteredMentions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setMentionIndex((i) => (i + 1) % filteredMentions.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setMentionIndex(
            (i) => (i - 1 + filteredMentions.length) % filteredMentions.length,
          );
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          acceptMention(filteredMentions[mentionIndex]);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setMentionQuery(null);
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage, mentionQuery, filteredMentions, mentionIndex, acceptMention],
  );

  // Update mention state on cursor movement (click, arrow keys in text)
  const handleSelect = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      updateMentionState(ta.value, ta.selectionStart);
    }
  }, [updateMentionState]);

  const disabled = connectionState !== 'connected';
  const busy = sending || uploading;

  return (
    <div className="position-relative">
      {/* Mention autocomplete popup */}
      {mentionQuery && filteredMentions.length > 0 && (
        <div className="tc-mention-popup">
          {filteredMentions.map((m, i) => (
            <button
              key={m.userId}
              type="button"
              className={`tc-mention-item ${
                i === mentionIndex ? 'is-active' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent textarea blur
                acceptMention(m);
              }}
              onMouseEnter={() => setMentionIndex(i)}
            >
              <div className="tc-mention-item__avatar">
                {m.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="tc-mention-item__name">{m.displayName}</span>
              <span className="tc-mention-item__id">{m.userId}</span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={sendMessage} className="tc-composer">
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.tar.gz"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          className="btn btn-icon btn-light"
          disabled={disabled || busy}
          onClick={() => fileInputRef.current?.click()}
          title={translate('Attach file')}
        >
          <PaperclipIcon weight="bold" />
        </button>
        <textarea
          ref={textareaRef}
          className="tc-composer-input"
          rows={1}
          value={message}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          placeholder={
            disabled
              ? translate('Connecting...')
              : uploading
                ? translate('Uploading...')
                : translate('Type a message...')
          }
          disabled={disabled || uploading}
        />
        <button
          type="submit"
          className="btn btn-primary btn-icon"
          disabled={disabled || !message.trim() || busy}
          title={
            disabled
              ? translate('Not connected')
              : !message.trim()
                ? translate('Enter a message to send')
                : translate('Send message')
          }
        >
          <PaperPlaneRightIcon weight="bold" />
        </button>
      </form>
    </div>
  );
};

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
