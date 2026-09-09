import { SparkleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import React, { useEffect, useRef } from 'react';

import { useAnonymousThreadContext } from '@/ai-assistant/anonymous/AnonymousThreadProvider';
import { resetDrawerDOM } from '@/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isAnonymousVisitor, isAssistantEnabled } from '@/ai-assistant/utils';
import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { BaseButton } from '@/core/buttons/BaseButton';
import { Tip } from '@/core/Tooltip';
import { useDrawer } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { isDrawerOpen, isDrawerOpenWithClass } from '@/drawer/utils';
import { translate } from '@/i18n';
import { isDescendantOf } from '@/navigation/useTabs';
import { useUser } from '@/workspace/hooks';

import { HeaderButtonBullet } from './HeaderButtonBullet';

/**
 * The assistant's only entry point. Same place for everyone so it survives
 * signing up, but a visitor gets the label — a bare sparkle tells a first-time
 * visitor nothing, and their header has room for words that a signed-in one,
 * already carrying search and support, does not.
 */
export const LLMChatDrawerToggle: React.FC = () => {
  const { openDrawer, closeDrawer } = useDrawer();
  const user = useUser();
  const prevUserUuid = useRef(user?.uuid);
  const { state } = useCurrentStateAndParams();
  const { hasNewMessages, currentThreadId, threads } = useThreadContext();
  const {
    messages: anonymousMessages,
    isRunning: anonymousIsRunning,
    hasUnreadReply: anonymousHasReply,
    setHasUnreadReply: setAnonymousHasReply,
  } = useAnonymousThreadContext();

  // Force-close drawer and clean up DOM when user changes (impersonation end/start)
  useEffect(() => {
    if (user?.uuid === prevUserUuid.current) return;
    prevUserUuid.current = user?.uuid;

    if (isDrawerOpen()) {
      closeDrawer();
    }
    resetDrawerDOM();
  }, [user?.uuid, closeDrawer]);

  // Visitors had no "new reply" signal at all: their stream finishes into
  // app-level state whether the drawer is open or not. Signed-in users get this
  // from ThreadProvider. The flag itself lives in AnonymousThreadProvider, so
  // opening the drawer from any entry point clears it — not just from here.
  const wasRunning = useRef(anonymousIsRunning);
  useEffect(() => {
    const justFinished = wasRunning.current && !anonymousIsRunning;
    wasRunning.current = anonymousIsRunning;
    if (justFinished && !isDrawerOpenWithClass(DRAWER_SHELL_CLASS.ai)) {
      setAnonymousHasReply(true);
    }
  }, [anonymousIsRunning, setAnonymousHasReply]);

  const isVisitor = isAnonymousVisitor(user);

  // The `home` callbacks (login_completed, SSO returns) exist for a redirect,
  // not for reading. `login`/`logout` need no check — they render no header.
  const isAuthCallback = state ? isDescendantOf('home', state) : false;

  if (!isAssistantEnabled(user) || isAuthCallback) {
    return null;
  }

  const toggleChatDrawer = () => {
    // Toggle off only when the AI drawer itself is open. If a different drawer
    // (Support, Pending confirmations) is open, switch to the AI assistant
    // rather than just closing it.
    if (isDrawerOpenWithClass(DRAWER_SHELL_CLASS.ai)) {
      closeDrawer();
    } else {
      // Both branches clear their marker on the drawer side (AnonymousChatPanel
      // / AuthenticatedChatDrawer), so every entry point behaves the same.
      openUnifiedChatDrawer(openDrawer);
    }
  };

  // Minimized: a conversation left behind the shut drawer. An unseen reply
  // blinks; one merely parked sits quiet so it cannot pass for a notification.
  const hasParkedChat = isVisitor
    ? anonymousMessages.length > 0
    : (threads.get(currentThreadId)?.length ?? 0) > 0;
  const hasReply = isVisitor ? anonymousHasReply : hasNewMessages;
  const marker = hasParkedChat ? (
    <HeaderButtonBullet
      variant={hasReply ? 'success' : 'gray-500'}
      blink={hasReply}
      className="pe-none"
    />
  ) : null;

  const dataState = hasReply
    ? 'unread'
    : hasParkedChat
      ? 'minimized'
      : 'closed';

  const label = hasParkedChat
    ? translate('Continue conversation')
    : translate('Ask the AI assistant');

  const control = isVisitor ? (
    // Prominence comes from the label, not a fill — a filled button among the
    // sign-in strip's ghost controls reads as bolted on.
    <BaseButton
      variant="tertiary"
      // The sign-in strip runs at 40px — the language select and the mode
      // switcher's `btn-icon` both take it from the form-control height. A
      // labelled button is 36px by default and `size="lg"` overshoots to 44.
      className="h-40px"
      label={label}
      iconNode={<SparkleIcon weight="bold" />}
      onClick={toggleChatDrawer}
      data-state={dataState}
      data-testid="llm-chat-drawer-toggle"
    />
  ) : (
    <Tip label={label} id="llm-chat-drawer-toggle-tip" placement="bottom">
      <button
        id="llm-chat-drawer-toggle"
        type="button"
        className="position-relative btn-nav-item"
        onClick={toggleChatDrawer}
        aria-label={label}
        data-state={dataState}
        data-testid="llm-chat-drawer-toggle"
      >
        <span className="svg-icon svg-icon-2">
          <SparkleIcon weight="bold" />
        </span>
      </button>
    </Tip>
  );

  return (
    <div className="d-flex align-items-center ms-1 position-relative">
      {control}
      {marker}
    </div>
  );
};
