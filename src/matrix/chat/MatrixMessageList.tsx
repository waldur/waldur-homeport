import {
  FC,
  Fragment,
  memo,
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

// Memoized: the composer's draft context (text + pending files) lives above
// this list in MatrixChatDrawer, so every keystroke re-renders the drawer.
// Without memo that cascade re-renders every message row on each keypress.
const MatrixMessageListInner: FC<MatrixMessageListProps> = ({
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
  // The message we keep stationary while content above the viewport changes
  // height — history prepend AND the images inside those older messages, which
  // decode asynchronously well after the prepend. Stored as the topmost visible
  // message plus its offset from the viewport top; a one-shot scrollHeight delta
  // can't cover the late image growth, which is what catapults the reader off
  // the pictures they were looking at.
  const anchorRef = useRef<{ eventId: string; top: number } | null>(null);
  const anchorRafRef = useRef<number | null>(null);
  const didInitialScrollRef = useRef(false);

  // Track if user is at the bottom before new messages arrive
  const checkIfAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    wasAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }, []);

  // Record the topmost visible message and its offset from the viewport top, so
  // a later height change above it can be undone. Skipped at the bottom — the
  // bottom-pin path owns that case.
  const captureAnchor = useCallback(() => {
    const el = containerRef.current;
    if (!el || wasAtBottomRef.current) {
      anchorRef.current = null;
      return;
    }
    const viewportTop = el.getBoundingClientRect().top;
    const nodes = el.querySelectorAll<HTMLElement>('[data-event-id]');
    for (let i = 0; i < nodes.length; i++) {
      const offset = nodes[i].getBoundingClientRect().top - viewportTop;
      if (offset >= 0) {
        anchorRef.current = { eventId: nodes[i].dataset.eventId!, top: offset };
        return;
      }
    }
    anchorRef.current = null;
  }, []);

  // Re-pin the anchored message to the offset it had when captured, absorbing
  // whatever height a prepend or a freshly decoded image added above it.
  const restoreAnchor = useCallback(() => {
    const el = containerRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor || wasAtBottomRef.current) return;
    const node = el.querySelector<HTMLElement>(
      `[data-event-id="${CSS.escape(anchor.eventId)}"]`,
    );
    if (!node) return;
    const offset =
      node.getBoundingClientRect().top - el.getBoundingClientRect().top;
    const delta = offset - anchor.top;
    if (Math.abs(delta) >= 1) el.scrollTop += delta;
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
  // and reaction-while-scrolled-up cases skip the scroll — the anchor-restore
  // effect below handles those.
  //
  // useLayoutEffect, not useEffect: the scroll must run before the browser
  // paints the freshly-mounted stream. With a post-paint effect the first
  // frame shows the timeline at scrollTop 0, then snaps to the bottom — a
  // visible flash of the oldest messages on every room open.
  useLayoutEffect(() => {
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
    // Keep the anchor tracking the topmost visible message as the user scrolls,
    // throttled to a frame: scroll fires far more often than content reflows.
    if (anchorRafRef.current == null) {
      anchorRafRef.current = requestAnimationFrame(() => {
        anchorRafRef.current = null;
        captureAnchor();
      });
    }
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
      // Capture now, synchronously, before the prepend — the throttled rAF
      // capture could otherwise land after older messages mount and re-anchor
      // to the wrong (new) top.
      if (anchorRafRef.current != null) {
        cancelAnimationFrame(anchorRafRef.current);
        anchorRafRef.current = null;
      }
      captureAnchor();
      onLoadOlder();
    }
  }, [
    captureAnchor,
    checkIfAtBottom,
    hasOlderMessages,
    loadingOlder,
    onLoadOlder,
    reportLatestRead,
  ]);

  // Media (images, video, stickers) resolve asynchronously and grow the
  // stream height after the one-shot initial scroll has already run. When
  // that growth lands while the viewport is parked at the bottom, re-pin so
  // a just-opened room with a trailing image still settles on the newest
  // message instead of stranding a half-screen above it. `load` doesn't
  // bubble, so the listener catches it in the capture phase.
  //
  // Depend on `loading`: the stream container only mounts once loading flips
  // false, so attaching on mount alone (a [] effect) would read a null ref
  // and never bind — exactly the case where media-driven growth happens.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMediaLoad = () => {
      // Parked at the bottom: keep the newest message in view. Scrolled up into
      // history: hold the reader's place as the image grows above them, instead
      // of letting that growth shove the timeline down.
      if (wasAtBottomRef.current) bottomRef.current?.scrollIntoView();
      else restoreAnchor();
    };
    el.addEventListener('load', onMediaLoad, true);
    return () => el.removeEventListener('load', onMediaLoad, true);
  }, [loading, restoreAnchor]);

  // After older messages prepend, re-pin the anchored message so the viewport
  // stays put instead of jumping. The media-load listener above keeps it pinned
  // as the prepended images decode afterwards.
  useLayoutEffect(() => {
    restoreAnchor();
  }, [messages, restoreAnchor]);

  useEffect(
    () => () => {
      if (anchorRafRef.current != null)
        cancelAnimationFrame(anchorRafRef.current);
    },
    [],
  );

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

export const MatrixMessageList = memo(MatrixMessageListInner);
