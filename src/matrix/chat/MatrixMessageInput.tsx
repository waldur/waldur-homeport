import {
  FileIcon,
  MicrophoneIcon,
  PaperPlaneRightIcon,
  PaperclipIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import {
  ClipboardEvent,
  FC,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Image } from '@/core/Image';
import { Tag } from '@/core/Tag';
import { translate } from '@/i18n';

import { useMatrixComposerDraft } from './MatrixComposerDraftContext';
import { useMatrixClient } from './useMatrixClient';
import { useRoomMemberNames } from './useRoomMemberNames';
import { isBotUser, resolveMemberName } from './utils';

interface MatrixMessageInputProps {
  uploadFile: (file: File) => Promise<boolean>;
  uploading: boolean;
  pendingFiles: File[];
  addFiles: (files: File[]) => void;
  removePending: (index: number) => void;
  setPending: (files: File[]) => void;
  clearPending: () => void;
  /**
   * Invoked when the user taps the microphone to start a voice message. The
   * owner holds the recorder and swaps in the recording controls.
   */
  onStartRecording?: () => void;
  /**
   * Whether the browser supports MediaRecorder + getUserMedia. When false the
   * mic is disabled with an explanatory tooltip rather than hidden, so the
   * affordance stays discoverable.
   */
  recordingSupported?: boolean;
  /**
   * True while a voice clip is recording or being sent. The composer keeps its
   * card and footer; only the textarea region is swapped for the recording UI.
   */
  recording?: boolean;
  /** Elapsed recording time in ms, shown in place of the textarea. */
  recordingElapsedMs?: number;
  /** True while the recorded clip is being finalized and uploaded. */
  sendingVoice?: boolean;
  /** Discard the in-progress recording and return to the text composer. */
  onCancelRecording?: () => void;
  /** Stop recording, then upload and send the clip. */
  onSendVoice?: () => void;
}

interface MentionCandidate {
  userId: string;
  displayName: string;
}

/** mm:ss for a millisecond duration; clamps negatives to 0. */
function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

/** Staged-but-unsent file previews shown above the composer. */
const PendingAttachments: FC<{
  files: File[];
  onRemove: (index: number) => void;
}> = ({ files, onRemove }) => {
  // One object URL per image file, created once and reused across re-renders;
  // recreating them on every append needlessly churns blob URLs.
  const urlCache = useRef(new Map<File, string>());
  const previews = files.map((f) => {
    if (!f.type.startsWith('image/')) return null;
    let url = urlCache.current.get(f);
    if (!url) {
      url = URL.createObjectURL(f);
      urlCache.current.set(f, url);
    }
    return url;
  });
  // Revoke URLs for files that left the pending set.
  useEffect(() => {
    const active = new Set(files);
    for (const [file, url] of urlCache.current) {
      if (!active.has(file)) {
        URL.revokeObjectURL(url);
        urlCache.current.delete(file);
      }
    }
  }, [files]);
  // Revoke everything on unmount.
  useEffect(() => {
    const cache = urlCache.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  if (files.length === 0) return null;

  return (
    <div className="tc-pending-attachments">
      {files.map((file, i) => (
        <Tag key={`${file.name}-${i}`} size="sm" onClear={() => onRemove(i)}>
          {previews[i] ? (
            <Image src={previews[i] as string} size={20} classes="me-1" />
          ) : (
            <FileIcon size={16} weight="bold" className="me-1" />
          )}
          {file.name}
        </Tag>
      ))}
    </div>
  );
};

export const MatrixMessageInput: FC<MatrixMessageInputProps> = ({
  uploadFile,
  uploading,
  pendingFiles,
  addFiles,
  removePending,
  setPending,
  clearPending,
  onStartRecording,
  recordingSupported = true,
  recording = false,
  recordingElapsedMs = 0,
  sendingVoice = false,
  onCancelRecording,
  onSendVoice,
}) => {
  const { client, activeRoomId, activeRoomUuid, connectionState, userId } =
    useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  // Draft text is kept per-room above the drawer so it survives a close/reopen.
  const { draft, setText: setMessage } = useMatrixComposerDraft(activeRoomId);
  const message = draft.text;
  const [sending, setSending] = useState(false);
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
    return (
      room
        .getJoinedMembers()
        .map((m: any) => ({
          userId: m.userId as string,
          displayName: resolveMemberName(m.userId, memberNames, m.name),
        }))
        // Exclude self and the appservice bot — the bot isn't a mentionable user.
        .filter(
          (m: MentionCandidate) => m.userId !== userId && !isBotUser(m.userId),
        )
        .sort((a: MentionCandidate, b: MentionCandidate) =>
          a.displayName.localeCompare(b.displayName),
        )
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
    [sendTypingIndicator, updateMentionState, setMessage],
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
    [message, mentionQuery, setMessage],
  );

  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const text = message.trim();
      const files = pendingFiles;
      if (
        (!text && files.length === 0) ||
        !client ||
        !activeRoomId ||
        sending ||
        uploading
      )
        return;

      setSending(true);
      isTypingRef.current = false;
      sendTypingIndicator(false);

      try {
        // Post staged attachments first. Keep any that fail staged (and keep
        // the text) so a partial failure is retryable instead of silently
        // dropping files; uploadFile already surfaced the error toast.
        if (files.length > 0) {
          const failed: File[] = [];
          for (const file of files) {
            const ok = await uploadFile(file);
            if (!ok) failed.push(file);
          }
          if (failed.length > 0) {
            setPending(failed);
            return;
          }
          clearPending();
        }
        if (!text) return;

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
    [
      message,
      pendingFiles,
      client,
      activeRoomId,
      sending,
      uploading,
      sendTypingIndicator,
      members,
      uploadFile,
      setPending,
      clearPending,
      setMessage,
    ],
  );

  const handleFileSelect = useCallback(() => {
    const files = fileInputRef.current?.files;
    if (files?.length) addFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  // Stage pasted files/images (e.g. a screenshot from the clipboard) instead of
  // letting them paste as nothing; text paste falls through untouched.
  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    },
    [addFiles],
  );

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
  const canSend = Boolean(message.trim()) || pendingFiles.length > 0;

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
              // The Matrix user ID disambiguates members who share a display
              // name; surfaced as a hover tooltip rather than a permanent second
              // line to keep the list compact.
              title={m.userId}
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
            </button>
          ))}
        </div>
      )}

      <form onSubmit={sendMessage} className="tc-composer">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="d-none"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.tar.gz"
          onChange={handleFileSelect}
        />
        {!recording && (
          <PendingAttachments files={pendingFiles} onRemove={removePending} />
        )}
        <div className="tc-composer-input-row">
          {recording ? (
            <div className="tc-voice-recording">
              <span className="tc-voice-recorder__dot" aria-hidden="true" />
              <span className="tc-voice-recorder__time">
                {formatClock(recordingElapsedMs)}
              </span>
              <span className="tc-voice-recorder__label">
                {sendingVoice
                  ? translate('Sending...')
                  : translate('Recording...')}
              </span>
            </div>
          ) : (
            <>
              <textarea
                ref={textareaRef}
                className="tc-composer-input"
                rows={1}
                value={message}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
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
                type="button"
                className="tc-composer-mic btn btn-icon"
                disabled={disabled || !recordingSupported}
                onClick={onStartRecording}
                title={
                  !recordingSupported
                    ? translate(
                        'Voice messages are not supported in this browser.',
                      )
                    : translate('Record voice message')
                }
              >
                <MicrophoneIcon weight="bold" />
              </button>
            </>
          )}
        </div>
        <div className="tc-composer-footer">
          {recording ? (
            <>
              <button
                type="button"
                className="tc-composer-button"
                onClick={onCancelRecording}
                disabled={sendingVoice}
                title={translate('Discard recording')}
              >
                <TrashIcon weight="bold" />
                {translate('Cancel')}
              </button>
              <button
                type="button"
                className="tc-composer-button send"
                onClick={onSendVoice}
                disabled={sendingVoice}
                title={translate('Send voice message')}
              >
                <PaperPlaneRightIcon weight="bold" />
                {translate('Send')}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="tc-composer-button"
                disabled={disabled || busy}
                onClick={() => fileInputRef.current?.click()}
                title={
                  disabled
                    ? translate('Not connected')
                    : translate('Attach a file')
                }
              >
                <PaperclipIcon weight="bold" />
                {translate('Attach')}
              </button>
              <button
                type="submit"
                className="tc-composer-button send"
                disabled={disabled || !canSend || busy}
                title={
                  disabled
                    ? translate('Not connected')
                    : !canSend
                      ? translate('Enter a message or attach a file')
                      : translate('Send message')
                }
              >
                <PaperPlaneRightIcon weight="bold" />
                {translate('Send')}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
