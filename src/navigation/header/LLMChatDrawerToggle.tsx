import { SparkleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import React, { useEffect, useRef, useState } from 'react';

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
 * The assistant's single entry point, in the header for everyone — but not at
 * the same weight.
 *
 * A visitor gets a labelled button, because the assistant may be their main way
 * to find a suitable service and a bare sparkle tells them nothing; their
 * header is otherwise empty, so there is room for words there that there isn't
 * beside search, support and the avatar. A signed-in user keeps the icon: they
 * are mid-task on dense pages, and the control is occasional.
 *
 * Keeping both in the header — rather than floating the visitor's version in a
 * corner — is what makes the entry point survive signing up. Someone who
 * discovers the assistant as a visitor finds it in the same place afterwards;
 * it only loses its label.
 */
export const LLMChatDrawerToggle: React.FC = () => {
  const { openDrawer, closeDrawer } = useDrawer();
  const user = useUser();
  const prevUserUuid = useRef(user?.uuid);
  const { state } = useCurrentStateAndParams();
  const { hasNewMessages, currentThreadId, clearNotification, threads } =
    useThreadContext();
  const { messages: anonymousMessages, isRunning: anonymousIsRunning } =
    useAnonymousThreadContext();

  // Force-close drawer and clean up DOM when user changes (impersonation end/start)
  useEffect(() => {
    if (user?.uuid === prevUserUuid.current) return;
    prevUserUuid.current = user?.uuid;

    if (isDrawerOpen()) {
      closeDrawer();
    }
    resetDrawerDOM();
  }, [user?.uuid, closeDrawer]);

  // A visitor's reply streams into app-level state whether or not the drawer is
  // open, and nothing tracked that it had finished unseen — so the anonymous
  // panel had no "new reply" signal at all. The authenticated side gets this
  // from ThreadProvider's notifications.
  const [anonymousHasReply, setAnonymousHasReply] = useState(false);
  const wasRunning = useRef(anonymousIsRunning);
  useEffect(() => {
    const justFinished = wasRunning.current && !anonymousIsRunning;
    wasRunning.current = anonymousIsRunning;
    if (justFinished && !isDrawerOpenWithClass(DRAWER_SHELL_CLASS.ai)) {
      setAnonymousHasReply(true);
    }
  }, [anonymousIsRunning]);

  const isVisitor = isAnonymousVisitor(user);

  // Signing in is not browsing: on the login screen and the auth callbacks
  // under `home`, an assistant button is only in the way.
  const isAuthScreen =
    state?.name === 'login' ||
    state?.name === 'logout' ||
    (state ? isDescendantOf('home', state) : false);

  if (!isAssistantEnabled(user) || isAuthScreen) {
    return null;
  }

  const toggleChatDrawer = () => {
    // Toggle off only when the AI drawer itself is open. If a different drawer
    // (Support, Pending confirmations) is open, switch to the AI assistant
    // rather than just closing it.
    if (isDrawerOpenWithClass(DRAWER_SHELL_CLASS.ai)) {
      closeDrawer();
    } else {
      if (isVisitor) {
        setAnonymousHasReply(false);
      } else {
        clearNotification(currentThreadId);
      }
      openUnifiedChatDrawer(openDrawer);
    }
  };

  // A conversation left behind the closed drawer — the minimized state. A reply
  // that landed while it was closed blinks; one merely waiting sits quiet, so
  // "there is something here" reads without impersonating a notification.
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

  // Named for the tests and for anyone inspecting the DOM: the three states the
  // control can be in while the drawer is shut.
  const dataState = hasReply
    ? 'unread'
    : hasParkedChat
      ? 'minimized'
      : 'closed';

  const label = hasParkedChat
    ? translate('Continue conversation')
    : translate('Ask the AI assistant');

  if (isVisitor) {
    return (
      <div className="d-flex align-items-center ms-1 position-relative">
        <BaseButton
          variant="secondary"
          label={label}
          iconNode={<SparkleIcon weight="bold" />}
          onClick={toggleChatDrawer}
          data-state={dataState}
          data-testid="llm-chat-drawer-toggle"
        />
        {marker}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center ms-1">
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
          {marker}
        </button>
      </Tip>
    </div>
  );
};
