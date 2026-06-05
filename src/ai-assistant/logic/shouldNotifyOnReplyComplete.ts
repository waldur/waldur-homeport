interface ReplyVisibility {
  /** Whether the chat drawer is currently open in the DOM. */
  drawerOpen: boolean;
  /** The chat drawer's active tab — 'ai' when the assistant is in view. */
  activeTab: string;
  /** The thread the user is currently focused on. */
  currentThreadId: string;
  /** The thread whose reply just finished streaming. */
  replyThreadId: string;
}

/**
 * Whether a just-finished AI reply should raise an unread badge. The user only
 * "saw the ending" when the drawer is open, the AI tab is active, and they are
 * still on the thread that produced it. Anything else — drawer closed, viewing
 * the Team chat tab, or moved to another thread — means they missed it.
 */
export const shouldNotifyOnReplyComplete = ({
  drawerOpen,
  activeTab,
  currentThreadId,
  replyThreadId,
}: ReplyVisibility): boolean =>
  !(drawerOpen && activeTab === 'ai' && currentThreadId === replyThreadId);
