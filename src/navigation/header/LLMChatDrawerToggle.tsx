import { SparkleIcon } from '@phosphor-icons/react';
import React, { useEffect, useRef } from 'react';

import { resetDrawerDOM } from '@/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isLLMChatAllowedForUser, getLLMChatMode } from '@/ai-assistant/utils';
import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { isDrawerOpen } from '@/drawer/utils';
import { translate } from '@/i18n';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useUser } from '@/workspace/hooks';

const LLMChatDrawer = lazyComponent(() =>
  import('@/ai-assistant/components/LLMChatDrawer').then((module) => ({
    default: module.LLMChatDrawer,
  })),
);

const LLMChatDrawerToolbar = lazyComponent(() =>
  import('@/ai-assistant/components/LLMChatDrawer').then((module) => ({
    default: module.LLMChatDrawerToolbar,
  })),
);

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

  if (!isLLMChatAllowedForUser(user, getLLMChatMode())) {
    return null;
  }

  const toggleChatDrawer = () => {
    if (isDrawerOpen()) {
      closeDrawer();
    } else {
      // Apply AI drawer class before the drawer opens so the slide-in
      // animation already has the correct top offset and z-index
      document
        .getElementById('kt_drawer')
        ?.classList.add('ai-chat-drawer-active');

      clearNotification(currentThreadId);
      openDrawer(LLMChatDrawer, {
        title: translate('AI Assistant'),
        toolbar: LLMChatDrawerToolbar,
        width: '800px',
      });
    }
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <button
        id="llm-chat-drawer-toggle"
        type="button"
        className="position-relative btn-nav-item"
        onClick={toggleChatDrawer}
        title={translate('Open AI Assistant')}
      >
        <span className="svg-icon svg-icon-2">
          <SparkleIcon weight="bold" />
        </span>
        {hasNewMessages && <HeaderButtonBullet />}
      </button>
    </div>
  );
};
