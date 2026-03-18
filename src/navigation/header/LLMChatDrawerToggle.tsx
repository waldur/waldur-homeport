import { SparkleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';
import {
  isLLMChatAllowedForUser,
  getLLMChatMode,
} from '@waldur/ai-assistant/utils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { HeaderButtonBullet } from '@waldur/navigation/header/HeaderButtonBullet';
import { useUser } from '@waldur/workspace/hooks';

const LLMChatDrawer = lazyComponent(() =>
  import('@waldur/ai-assistant/components/LLMChatDrawer').then((module) => ({
    default: module.LLMChatDrawer,
  })),
);

export const LLMChatDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();
  const user = useUser();
  const { hasNewMessages, setHasNewMessages } = useThreadContext();

  if (!isLLMChatAllowedForUser(user, getLLMChatMode())) {
    return null;
  }

  const openChatDrawer = () => {
    // Clear the unread indicator when drawer opens
    setHasNewMessages(false);
    dispatch(
      openDrawerDialog(LLMChatDrawer, {
        title: translate('AI Assistant'),
        size: 'lg',
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <button
        id="llm-chat-drawer-toggle"
        type="button"
        className="position-relative btn-nav-item"
        onClick={openChatDrawer}
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
