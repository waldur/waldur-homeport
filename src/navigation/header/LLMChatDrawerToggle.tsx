import { SparkleIcon } from '@phosphor-icons/react';
import React, { useEffect, useRef } from 'react';

import { resetDrawerDOM } from '@/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isAssistantEnabled } from '@/ai-assistant/utils';
import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { useDrawer } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { isDrawerOpen, isDrawerOpenWithClass } from '@/drawer/utils';
import { translate } from '@/i18n';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useUser } from '@/workspace/hooks';

export const LLMChatDrawerToggle: React.FC = () => {
  const { openDrawer, closeDrawer } = useDrawer();
  const user = useUser();
  const prevUserUuid = useRef(user?.uuid);
  const { hasNewMessages, currentThreadId, clearNotification } =
    useThreadContext();

  // Force-close drawer and clean up DOM when user changes (impersonation end/start)
  useEffect(() => {
    if (user?.uuid === prevUserUuid.current) return;
    prevUserUuid.current = user?.uuid;

    if (isDrawerOpen()) {
      closeDrawer();
    }
    resetDrawerDOM();
  }, [user?.uuid, closeDrawer]);

  if (!isAssistantEnabled(user)) {
    return null;
  }

  const toggleChatDrawer = () => {
    // Toggle off only when the AI drawer itself is open. If a different drawer
    // (Support, Pending confirmations) is open, switch to the AI assistant
    // rather than just closing it.
    if (isDrawerOpenWithClass(DRAWER_SHELL_CLASS.ai)) {
      closeDrawer();
    } else {
      clearNotification(currentThreadId);
      openUnifiedChatDrawer(openDrawer);
    }
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <button
        id="llm-chat-drawer-toggle"
        type="button"
        className="position-relative btn-nav-item"
        onClick={toggleChatDrawer}
        title={translate('Open AI assistant')}
      >
        <span className="svg-icon svg-icon-2">
          <SparkleIcon weight="bold" />
        </span>
        {hasNewMessages && <HeaderButtonBullet />}
      </button>
    </div>
  );
};
