import {
  FC,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixChatMessage } from './types';
import { formatDateSeparator, getSenderName } from './utils';

interface MatrixMessageListProps {
  messages: MatrixChatMessage[];
  userId: string | null;
  memberNames: Map<string, string>;
  loading: boolean;
  loadingOlder: boolean;
  hasOlderMessages: boolean;
  onLoadOlder: () => void;
  onReadLatest?: (eventId: string) => void;
}

function shouldShowDateSeparator(
  messages: MatrixChatMessage[],
  index: number,
): boolean {
  if (index === 0) return true;
  const current = new Date(messages[index].timestamp).toDateString();
  const previous = new Date(messages[index - 1].timestamp).toDateString();
  return current !== previous;
}

const CONTINUATION_WINDOW_MS = 5 * 60 * 1000;

function isContinuation(messages: MatrixChatMessage[], index: number): boolean {
  if (index === 0 || shouldShowDateSeparator(messages, index)) return false;
  const current = messages[index];
  const previous = messages[index - 1];
  return (
    current.sender === previous.sender &&
    current.timestamp - previous.timestamp < CONTINUATION_WINDOW_MS
  );
}

export const MatrixMessageList: FC<MatrixMessageListProps> = ({
  messages,
  userId,
  memberNames,
  loading,
  loadingOlder,
  hasOlderMessages,
  onLoadOlder,
  onReadLatest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);
  // scrollHeight captured before a scroll-triggered history load, so the
  // viewport can be restored after older messages prepend (no visible jump).
  const pendingScrollAnchorRef = useRef<number | null>(null);
  const didInitialScrollRef = useRef(false);

  // Track if user is at the bottom before new messages arrive
  const checkIfAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    wasAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }, []);

  // Report the newest message as read whenever it sits at the bottom of the
  // viewport — on open, after auto-scrolling to a new message, or once the
  // user scrolls back down. This is what clears the room's unread badge.
  const reportLatestRead = useCallback(() => {
    if (loading || messages.length === 0) return;
    onReadLatest?.(messages[messages.length - 1].eventId);
  }, [loading, messages, onReadLatest]);

  // Keep the viewport pinned to the bottom for: initial load, tail updates
  // while the user is parked at the bottom, and the rapid fill-too-short
  // backfill cycles that pad out a too-short stream. The history-prepend
  // and reaction-while-scrolled-up cases skip the scroll — useLayoutEffect's
  // anchor restore handles those.
  useEffect(() => {
    if (loading) {
      didInitialScrollRef.current = false;
      return;
    }
    if (messages.length === 0) return;
    if (didInitialScrollRef.current && !wasAtBottomRef.current) return;
    didInitialScrollRef.current = true;
    bottomRef.current?.scrollIntoView();
    reportLatestRead();
  }, [loading, messages, reportLatestRead]);

  const handleScroll = useCallback(() => {
    checkIfAtBottom();
    if (wasAtBottomRef.current) reportLatestRead();
    const el = containerRef.current;
    if (!el) return;
    // Only treat low scrollTop as "user scrolled to top" when content
    // actually overflows. When scrollHeight <= clientHeight, scrollTop is
    // pinned to 0 by layout — that's not a user signal, and anchoring at
    // that point would strand the viewport mid-history after the backfill.
    // fillIfTooShort handles the short-content case instead.
    if (
      el.scrollHeight > el.clientHeight &&
      el.scrollTop < 120 &&
      hasOlderMessages &&
      !loadingOlder
    ) {
      pendingScrollAnchorRef.current = el.scrollHeight;
      onLoadOlder();
    }
  }, [
    checkIfAtBottom,
    hasOlderMessages,
    loadingOlder,
    onLoadOlder,
    reportLatestRead,
  ]);

  // After older messages prepend, shift the viewport down by the added
  // height so it stays on the same message instead of jumping.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el && pendingScrollAnchorRef.current != null) {
      const delta = el.scrollHeight - pendingScrollAnchorRef.current;
      pendingScrollAnchorRef.current = null;
      if (delta > 0) {
        el.scrollTop += delta;
      }
    }
  }, [messages]);

  // Keep the stream tall enough to scroll: while it doesn't overflow, pull
  // older messages until it does (or history runs out). The ResizeObserver
  // re-checks when the panel becomes visible or is resized.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fillIfTooShort = () => {
      if (
        el.clientHeight > 0 &&
        el.scrollHeight <= el.clientHeight &&
        hasOlderMessages &&
        !loadingOlder &&
        !loading
      ) {
        onLoadOlder();
      }
    };
    fillIfTooShort();
    const observer = new ResizeObserver(fillIfTooShort);
    observer.observe(el);
    return () => observer.disconnect();
  }, [messages, hasOlderMessages, loadingOlder, loading, onLoadOlder]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <LoadingSpinner />
      </div>
    );
  }

  // The stream container must mount even when `messages` is empty so the
  // fill-if-too-short effect above can trigger a scrollback. Without it, a
  // room whose initial sync only brought state events (no displayable
  // messages) stays stuck on the empty state until the user sends a message
  // and reopens the room.
  const showEmptyState = messages.length === 0 && !loadingOlder;

  return (
    <div ref={containerRef} className="tc-stream h-100" onScroll={handleScroll}>
      {loadingOlder && (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      )}
      {showEmptyState ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1 text-muted">
          {translate('No messages yet. Start the conversation!')}
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <Fragment key={msg.eventId}>
              {shouldShowDateSeparator(messages, i) && (
                <div className="tc-day">
                  <span>{formatDateSeparator(msg.timestamp)}</span>
                </div>
              )}
              <MatrixMessageItem
                message={msg}
                isOwn={msg.sender === userId}
                senderName={getSenderName(msg, memberNames)}
                continuation={isContinuation(messages, i)}
                memberNames={memberNames}
                currentUserId={userId}
              />
            </Fragment>
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};
