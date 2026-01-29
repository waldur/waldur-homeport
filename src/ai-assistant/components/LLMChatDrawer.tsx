import { useEffect } from 'react';

import { LLMErrorBoundary } from '@waldur/ai-assistant/components/LLMErrorBoundary';
import { Thread } from '@waldur/ai-assistant/components/Thread';
import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';
import { isDrawerOpen } from '@waldur/drawer/utils';

interface LLMChatDrawerProps {
  close?: () => void;
}

export const LLMChatDrawer: React.FC<LLMChatDrawerProps> = ({ close }) => {
  const { hasNewMessages, setHasNewMessages } = useThreadContext();

  // Clear notification if it gets set while drawer is shown
  useEffect(() => {
    if (hasNewMessages && isDrawerOpen()) {
      setHasNewMessages(false);
    }
  }, [hasNewMessages]);

  return (
    <div className="h-100 d-flex flex-column">
      {/* Chat messages area - grows to fill space */}
      <div className="flex-grow-1 overflow-auto">
        <LLMErrorBoundary onClose={close}>
          <Thread />
        </LLMErrorBoundary>
      </div>
    </div>
  );
};
