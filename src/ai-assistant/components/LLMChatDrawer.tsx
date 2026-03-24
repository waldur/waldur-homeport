import { useEffect, useState } from 'react';

import { AIDisclosureBanner } from '@waldur/ai-assistant/components/AIDisclosureDialog';
import { LLMErrorBoundary } from '@waldur/ai-assistant/components/LLMErrorBoundary';
import { Thread } from '@waldur/ai-assistant/components/Thread';
import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';
import {
  acknowledgeDisclosure,
  isDisclosureAcknowledged,
} from '@waldur/ai-assistant/utils';
import { isDrawerOpen } from '@waldur/drawer/utils';

interface LLMChatDrawerProps {
  close?: () => void;
}

export const LLMChatDrawer: React.FC<LLMChatDrawerProps> = ({ close }) => {
  const { hasNewMessages, setHasNewMessages } = useThreadContext();
  const [showDisclosure, setShowDisclosure] = useState(
    () => !isDisclosureAcknowledged(),
  );

  // Clear notification if it gets set while drawer is shown
  useEffect(() => {
    if (hasNewMessages && isDrawerOpen()) {
      setHasNewMessages(false);
    }
  }, [hasNewMessages]);

  const handleAcknowledge = () => {
    acknowledgeDisclosure();
    setShowDisclosure(false);
  };

  if (showDisclosure) {
    return (
      <div className="aui-chat-drawer">
        <AIDisclosureBanner onAcknowledge={handleAcknowledge} />
      </div>
    );
  }

  return (
    <div className="aui-chat-drawer">
      {/* Chat messages area - grows to fill space */}
      <div className="flex-grow-1 overflow-auto">
        <LLMErrorBoundary onClose={close}>
          <Thread />
        </LLMErrorBoundary>
      </div>
    </div>
  );
};
