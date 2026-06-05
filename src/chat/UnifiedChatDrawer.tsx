import { ChatsCircleIcon, SparkleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useState } from 'react';

import { LLMChatDrawer } from '@/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isLLMChatAllowedForUser, getLLMChatMode } from '@/ai-assistant/utils';
import {
  ChatDrawerTab,
  getChatDrawerPreference,
  setChatDrawerPreference,
} from '@/chat/chatDrawerPreferences';
import { resolveInitialTab } from '@/chat/resolveInitialTab';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { MatrixChatPanel } from '@/matrix/chat/MatrixChatPanel';
import { useUser } from '@/workspace/hooks';

interface UnifiedChatDrawerProps {
  defaultRoomUuid?: string;
  matrixRoomAlias?: string;
  close?: () => void;
}

export const UnifiedChatDrawer: FC<UnifiedChatDrawerProps> = ({
  defaultRoomUuid,
  matrixRoomAlias,
  close,
}) => {
  const user = useUser();
  const showAI = isLLMChatAllowedForUser(user, getLLMChatMode());
  const showMatrix = isFeatureVisible(ProjectFeatures.show_matrix_chat);
  const showTabs = showAI && showMatrix;

  const [activeTab, setActiveTab] = useState<ChatDrawerTab>(() =>
    resolveInitialTab({
      storedTab: getChatDrawerPreference('activeTab'),
      hasRoomDeepLink: Boolean(defaultRoomUuid),
      showAI,
      showMatrix,
    }),
  );

  // Mirror the resolved tab into shared prefs so the drawer toolbar (which
  // renders outside this tree) can hide AI-only controls when matrix is active.
  useEffect(() => {
    setChatDrawerPreference('activeTab', activeTab);
  }, [activeTab]);

  const selectTab = useCallback((tab: ChatDrawerTab) => {
    setActiveTab(tab);
  }, []);

  const [matrixUnread, setMatrixUnread] = useState(0);
  const handleUnreadChange = useCallback((count: number) => {
    setMatrixUnread(count);
  }, []);

  // Count of AI threads with an unseen reply — mirrors the Team chat badge.
  const { threadNotifications, clearNotification, currentThreadId } =
    useThreadContext();
  const aiUnread = threadNotifications.size;

  // Switching to (or opening on) the AI tab means the user is now looking at
  // the open thread, so clear its notification — otherwise the badge would
  // linger after they've seen the reply.
  useEffect(() => {
    if (activeTab === 'ai') clearNotification(currentThreadId);
  }, [activeTab, currentThreadId, clearNotification]);

  return (
    <div
      className={`unified-chat-drawer h-100 d-flex flex-column${
        showTabs ? '' : ' unified-chat-drawer--single'
      }`}
    >
      {showTabs && (
        <div className="px-3 pt-2 pb-3" style={{ width: 320, flexShrink: 0 }}>
          <ul className="nav nav-pills gap-2 justify-content-center">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link d-flex align-items-center gap-1 py-1 px-2 ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => selectTab('ai')}
              >
                <SparkleIcon size={16} weight="bold" />
                {translate('AI Assistant')}
                {aiUnread > 0 && (
                  <span className="badge bg-primary rounded-pill">
                    {aiUnread > 99 ? '99+' : aiUnread}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link d-flex align-items-center gap-1 py-1 px-2 ${activeTab === 'matrix' ? 'active' : ''}`}
                onClick={() => selectTab('matrix')}
              >
                <ChatsCircleIcon size={16} weight="bold" />
                {translate('Team chat')}
                {matrixUnread > 0 && (
                  <span className="badge bg-primary rounded-pill">
                    {matrixUnread > 99 ? '99+' : matrixUnread}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      )}

      {showAI && (
        <div
          className="flex-grow-1 overflow-hidden"
          style={{ display: activeTab === 'ai' ? 'flex' : 'none' }}
        >
          <div className="h-100 w-100 d-flex flex-column">
            <LLMChatDrawer close={close} />
          </div>
        </div>
      )}

      {showMatrix && (
        <div
          className="flex-grow-1 overflow-hidden"
          style={{ display: activeTab === 'matrix' ? 'flex' : 'none' }}
        >
          <div className="h-100 w-100 d-flex flex-column">
            <MatrixChatPanel
              defaultRoomUuid={defaultRoomUuid}
              defaultRoomAlias={matrixRoomAlias}
              onTotalUnreadChange={showTabs ? handleUnreadChange : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};
