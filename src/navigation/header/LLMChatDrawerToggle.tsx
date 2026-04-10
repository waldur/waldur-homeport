import { SparkleIcon } from '@phosphor-icons/react';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { resetDrawerDOM } from '@waldur/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';
import {
  isLLMChatAllowedForUser,
  getLLMChatMode,
} from '@waldur/ai-assistant/utils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog, closeDrawerDialog } from '@waldur/drawer/actions';
import { isDrawerOpen } from '@waldur/drawer/utils';
import { translate } from '@waldur/i18n';
import { HeaderButtonBullet } from '@waldur/navigation/header/HeaderButtonBullet';
import { useUser } from '@waldur/workspace/hooks';

const LLMChatDrawer = lazyComponent(() =>
  import('@waldur/ai-assistant/components/LLMChatDrawer').then((module) => ({
    default: module.LLMChatDrawer,
  })),
);

const LLMChatDrawerToolbar = lazyComponent(() =>
  import('@waldur/ai-assistant/components/LLMChatDrawer').then((module) => ({
    default: module.LLMChatDrawerToolbar,
  })),
);

export const LLMChatDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();
  const user = useUser();
  const prevUserUuid = useRef(user?.uuid);
  const { hasNewMessages, currentThreadId, clearNotification } =
    useThreadContext();

  // Force-close drawer and clean up DOM when user changes (impersonation end/start)
  useEffect(() => {
    if (user?.uuid === prevUserUuid.current) return;
    prevUserUuid.current = user?.uuid;

    if (isDrawerOpen()) {
      dispatch(closeDrawerDialog());
    }
    resetDrawerDOM();
  }, [user?.uuid, dispatch]);

  if (!isLLMChatAllowedForUser(user, getLLMChatMode())) {
    return null;
  }

  const toggleChatDrawer = () => {
    if (isDrawerOpen()) {
      dispatch(closeDrawerDialog());
    } else {
      // Apply AI drawer class before the drawer opens so the slide-in
      // animation already has the correct top offset and z-index
      document
        .getElementById('kt_drawer')
        ?.classList.add('ai-chat-drawer-active');

      clearNotification(currentThreadId);
      dispatch(
        openDrawerDialog(LLMChatDrawer, {
          title: translate('AI Assistant'),
          toolbar: LLMChatDrawerToolbar,
          size: 'lg',
        }),
      );
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
