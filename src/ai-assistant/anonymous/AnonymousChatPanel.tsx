import { FC } from 'react';

import { LLMErrorBoundary } from '@/ai-assistant/components/LLMErrorBoundary';

import { AnonymousThread } from './AnonymousThread';
import { AnonymousThreadRuntimeProvider } from './AnonymousThreadRuntimeProvider';

interface AnonymousChatPanelProps {
  close?: () => void;
}

export const AnonymousChatPanel: FC<AnonymousChatPanelProps> = ({ close }) => (
  <AnonymousThreadRuntimeProvider>
    <div className="h-100 w-100 d-flex flex-column">
      <LLMErrorBoundary onClose={close}>
        <AnonymousThread />
      </LLMErrorBoundary>
    </div>
  </AnonymousThreadRuntimeProvider>
);
