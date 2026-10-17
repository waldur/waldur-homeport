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

import { BaseButton, Tag } from 'waldur-ui';

import { Image } from '@/core/Image';
import { translate } from '@/i18n';

import {
  CommandPopup,
  commandOptionId,
  COMMAND_POPUP_ID,
} from './commands/CommandPopup';
import {
  ComposerCommand,
  filterCommands,
  getCommandQuery,
  resolveOutgoingText,
} from './commands/composerCommands';
import { useComposerCommands } from './commands/useComposerCommands';
import {
  handleComposerPopupKey,
  useComposerPopupList,
} from './composerPopupKeys';
import { useMatrixComposerDraft } from './MatrixComposerDraftContext';
import { useMatrixMessageActions } from './MatrixMessageActionsContext';
import { MatrixComposerReplyBar } from './MatrixReplyQuote';
import {
  buildReplyContent,
  buildReplyFields,
  buildTextContent,
  MentionCandidate,
} from './messageContent';
import { useMatrixClient } from './useMatrixClient';
import { useMentionCandidates } from './useMentionCandidates';
import { useRoomMemberNames } from './useRoomMemberNames';
import { getSenderName } from './utils';

interface MatrixMessageInputProps {
  uploadFile: (
    file: File,
    buildContent?: undefined,
    extraContent?: Record<string, any>,
  ) => Promise<boolean>;
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
  const mentionList = useComposerPopupList(mentionIndex, setMentionIndex);
  const [commandIndex, setCommandIndex] = useState(0);
  // Esc closes the command menu until the text changes.
  const [commandsDismissed, setCommandsDismissed] = useState(false);
  // Why a `/` command was kept from being sent.
  const [commandHint, setCommandHint] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get room members for mention autocomplete
  const members = useMentionCandidates();
  const {
    replyTo,
    cancelReply,
    editLastOwnMessage,
    pickedCommand,
    clearPickedCommand,
  } = useMatrixMessageActions();

  // Starting a reply puts the cursor in the composer to write it.
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

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

  const {
    commands: composerCommands,
    botCommandsLoaded,
    runClientCommand,
  } = useComposerCommands();
  const commandQuery = getCommandQuery(message);
  const filteredCommands = useMemo(
    () =>
      commandQuery && !commandsDismissed
        ? filterCommands(
            composerCommands,
            commandQuery.query,
            commandQuery.prefix,
          )
        : [],
    [
      composerCommands,
      commandQuery?.prefix,
      commandQuery?.query,
      commandsDismissed,
    ],
  );
  const showCommands = filteredCommands.length > 0;

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

  // The menu's state and a hint are about the text in the room left behind.
  useEffect(() => {
    setCommandIndex(0);
    setCommandsDismissed(false);
    setCommandHint(null);
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
      setCommandIndex(0);
      setCommandsDismissed(false);
      setCommandHint(null);
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

  // Picking a command, from the menu or the commands dialog, puts it in the
  // composer with a space and keeps the menu closed until the text changes,
  // so the next Enter sends rather than picking a subcommand. The cursor
  // goes after the command, before any `rest` kept from the text typed.
  const insertCommand = useCallback(
    (command: string, rest = '') => {
      setMessage(command + rest);
      setCommandIndex(0);
      setCommandsDismissed(true);
      setCommandHint(null);
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(command.length, command.length);
        }
      });
    },
    [setMessage],
  );

  const acceptCommand = useCallback(
    (command: ComposerCommand) => {
      if (!commandQuery) return;
      insertCommand(`${commandQuery.prefix}${command.name} `);
    },
    [commandQuery, insertCommand],
  );

  // Read when a command is picked, not a reason to insert it again.
  const messageRef = useRef(message);
  messageRef.current = message;
  useEffect(() => {
    if (!pickedCommand) return;
    // What is typed already becomes what the command is about
    // (`/ticket VM is down`), unless it is a command itself.
    const typed = messageRef.current.trimStart();
    insertCommand(`/${pickedCommand} `, /^[!/]/.test(typed) ? '' : typed);
    clearPickedCommand();
  }, [pickedCommand, insertCommand, clearPickedCommand]);

  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const outgoing = resolveOutgoingText(
        message.trim(),
        composerCommands,
        botCommandsLoaded,
      );
      if (outgoing.kind === 'unknown-command') {
        setCommandHint(
          translate(
            'Unknown command /{command}. Type / for the list, or start with // to send it as text.',
            { command: outgoing.command },
          ),
        );
        return;
      }
      if (outgoing.kind === 'unavailable-command') {
        setCommandHint(
          outgoing.reason
            ? translate("/{command} isn't available here: {reason}", {
                command: outgoing.command,
                reason: outgoing.reason,
              })
            : translate("/{command} isn't available here.", {
                command: outgoing.command,
              }),
        );
        return;
      }
      if (outgoing.kind === 'client-command') {
        if (sending || uploading) return;
        // Runs in Waldur; nothing goes to the room.
        runClientCommand(outgoing.command);
        handleInput('');
        return;
      }
      const text = outgoing.text;
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
        // An open reply goes with the text, or with the first file when
        // there is no text.
        const reply = replyTo
          ? buildReplyFields(replyTo.eventId, replyTo.sender, userId)
          : undefined;
        if (files.length > 0) {
          const failed: File[] = [];
          for (const [i, file] of files.entries()) {
            const replyHere = reply && !text && i === 0;
            const ok = await uploadFile(
              file,
              undefined,
              replyHere ? reply : undefined,
            );
            if (ok && replyHere) cancelReply();
            if (!ok) failed.push(file);
          }
          if (failed.length > 0) {
            setPending(failed);
            return;
          }
          clearPending();
        }
        if (!text) return;

        // Mention pills for the Matrix spec (org.matrix.msc3952).
        const content = buildTextContent(text, members);
        if (replyTo) {
          await client.sendMessage(
            activeRoomId,
            buildReplyContent(
              content,
              replyTo.eventId,
              replyTo.sender,
              userId,
            ) as any,
          );
          cancelReply();
        } else if (content['m.mentions']) {
          await client.sendMessage(activeRoomId, content as any);
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
      composerCommands,
      botCommandsLoaded,
      runClientCommand,
      handleInput,
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
      replyTo,
      cancelReply,
      userId,
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
      // An input method editor's keys are its own: its Enter confirms the
      // composed text. Safari reports that Enter after compositionend, so
      // only keyCode 229 tells.
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;
      // A command typed out in full that takes nothing more is sent on Enter,
      // as before the menu (`!status`); one with arguments is inserted first.
      const activeCommand =
        filteredCommands[Math.min(commandIndex, filteredCommands.length - 1)];
      const sendsAsTyped =
        e.key === 'Enter' &&
        !!activeCommand &&
        !activeCommand.args &&
        commandQuery?.query === activeCommand.name.toLowerCase();
      // While a popup is open, keys move in it and pick from it; Enter sends
      // only once it is closed.
      if (
        !sendsAsTyped &&
        (handleComposerPopupKey(e, {
          items: filteredCommands,
          activeIndex: commandIndex,
          setActiveIndex: setCommandIndex,
          onPick: acceptCommand,
          onClose: () => setCommandsDismissed(true),
        }) ||
          handleComposerPopupKey(e, {
            items: filteredMentions,
            activeIndex: mentionIndex,
            setActiveIndex: setMentionIndex,
            onPick: acceptMention,
            onClose: () => setMentionQuery(null),
          }))
      ) {
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        return;
      }
      if (e.key === 'Escape' && replyTo) {
        e.preventDefault();
        cancelReply();
        return;
      }
      // Up in an empty composer edits the user's last message, as in other
      // chat clients.
      if (
        e.key === 'ArrowUp' &&
        !message &&
        pendingFiles.length === 0 &&
        editLastOwnMessage()
      ) {
        e.preventDefault();
      }
    },
    [
      filteredCommands,
      commandIndex,
      commandQuery?.query,
      acceptCommand,
      sendMessage,
      filteredMentions,
      mentionIndex,
      acceptMention,
      replyTo,
      cancelReply,
      message,
      pendingFiles.length,
      editLastOwnMessage,
    ],
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
      {showCommands && commandQuery && (
        <CommandPopup
          commands={filteredCommands}
          prefix={commandQuery.prefix}
          activeIndex={Math.min(commandIndex, filteredCommands.length - 1)}
          onSelect={acceptCommand}
          onActivate={setCommandIndex}
        />
      )}
      {commandHint && (
        <div className="tc-composer-hint text-danger" role="alert">
          {commandHint}
        </div>
      )}
      {/* Mention autocomplete popup */}
      {mentionQuery && filteredMentions.length > 0 && (
        <div ref={mentionList.listRef} className="tc-mention-popup">
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
              onMouseMove={mentionList.pointAt(i)}
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
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.tar.gz"
          onChange={handleFileSelect}
        />
        {!recording && replyTo && (
          <MatrixComposerReplyBar
            message={replyTo}
            senderName={
              replyTo.sender === userId
                ? null
                : getSenderName(replyTo, memberNames)
            }
            onCancel={cancelReply}
          />
        )}
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
                // Focus stays here while the command menu points at its
                // active option.
                aria-label={translate('Message')}
                aria-haspopup="listbox"
                aria-autocomplete={showCommands ? 'list' : undefined}
                aria-controls={showCommands ? COMMAND_POPUP_ID : undefined}
                aria-activedescendant={
                  showCommands
                    ? commandOptionId(
                        Math.min(commandIndex, filteredCommands.length - 1),
                      )
                    : undefined
                }
                placeholder={
                  disabled
                    ? translate('Connecting...')
                    : uploading
                      ? translate('Uploading...')
                      : translate('Type a message...')
                }
                disabled={disabled || uploading}
              />
              <BaseButton
                variant="text-secondary"
                className="tc-composer-mic"
                disabled={disabled || !recordingSupported}
                onClick={onStartRecording}
                tooltip={
                  !recordingSupported
                    ? translate(
                        'Voice messages are not supported in this browser.',
                      )
                    : translate('Record voice message')
                }
                iconNode={<MicrophoneIcon weight="bold" />}
              />
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
