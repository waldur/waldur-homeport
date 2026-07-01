import { FC, useEffect } from 'react';

import { LLMChatDrawer } from '@/ai-assistant/components/LLMChatDrawer';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { setChatDrawerPreference } from '@/chat/chatDrawerPreferences';

interface UnifiedChatDrawerProps {
  close?: () => void;
}

/**
 * The sparkle drawer is AI-only. Team chat moved to the Support drawer; this
 * keeps the `unified-chat-drawer` wrapper so the drawer body fill-height SCSS
 * still applies and the expand toolbar keeps working.
 */
export const UnifiedChatDrawer: FC<UnifiedChatDrawerProps> = ({ close }) => {
  // The drawer toolbar (rendered outside this tree) keys its history toggle off
  // the shared activeTab pref; pin it to AI so that control stays visible.
  useEffect(() => {
    setChatDrawerPreference('activeTab', 'ai');
  }, []);

  // Opening the drawer means the user is now looking at the open thread, so
  // clear its notification.
  const { clearNotification, currentThreadId } = useThreadContext();
  useEffect(() => {
    clearNotification(currentThreadId);
  }, [currentThreadId, clearNotification]);

  return (
    <div className="unified-chat-drawer unified-chat-drawer--single h-100 d-flex flex-column">
      <div className="flex-grow-1 overflow-hidden d-flex">
        <div className="h-100 w-100 d-flex flex-column">
          <LLMChatDrawer close={close} />
        </div>
      </div>
    </div>
  );
};
