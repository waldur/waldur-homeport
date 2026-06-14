import { SparkleIcon } from '@phosphor-icons/react';
import React, { useEffect, useRef } from 'react';

import { resetDrawerDOM } from '@/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isLLMChatAllowedForUser, getLLMChatMode } from '@/ai-assistant/utils';
import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { useDrawer } from '@/drawer/actions';
import { isDrawerOpen } from '@/drawer/utils';
import { translate } from '@/i18n';
import { useMatrixTotalUnread } from '@/matrix/chat/useMatrixTotalUnread';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useUser } from '@/workspace/hooks';

export const LLMChatDrawerToggle: React.FC = () => {
  const { openDrawer, closeDrawer } = useDrawer();
  const user = useUser();
  const prevUserUuid = useRef(user?.uuid);
  const { hasNewMessages, currentThreadId, clearNotification } =
    useThreadContext();
  const matrixUnread = useMatrixTotalUnread();

  // Force-close drawer and clean up DOM when user changes (impersonation end/start)
  useEffect(() => {
    if (user?.uuid === prevUserUuid.current) return;
    prevUserUuid.current = user?.uuid;

    if (isDrawerOpen()) {
      closeDrawer();
    }
    resetDrawerDOM();
  }, [user?.uuid, closeDrawer]);

  const showAI = isLLMChatAllowedForUser(user, getLLMChatMode());
  const showMatrix = isMatrixChatEnabled();

  if (!showAI && !showMatrix) {
    return null;
  }

  const toggleChatDrawer = () => {
    if (isDrawerOpen()) {
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
        title={translate('Open chat')}
      >
        <span className="svg-icon svg-icon-2">
          <SparkleIcon weight="bold" />
        </span>
        {((showAI && hasNewMessages) || (showMatrix && matrixUnread > 0)) && (
          <HeaderButtonBullet />
        )}
      </button>
    </div>
  );
};
