import React from 'react';

import { LLMErrorBoundary } from '@waldur/ai-assistant/components/LLMErrorBoundary';
import { Thread } from '@waldur/ai-assistant/components/Thread';

interface LLMChatDrawerProps {
  close?: () => void;
}

export const LLMChatDrawer: React.FC<LLMChatDrawerProps> = ({ close }) => {
  return (
    <div className="h-100 d-flex flex-column">
      {/* Chat messages area - grows to fill space */}
      <div className="flex-grow-1 overflow-auto">
        <LLMErrorBoundary onClose={close}>
          <Thread onClose={close} hideCloseButton={true} />
        </LLMErrorBoundary>
      </div>
    </div>
  );
};
