import { FC, useEffect } from 'react';

import { LLMErrorBoundary } from '@/ai-assistant/components/LLMErrorBoundary';

import { AnonymousThread } from './AnonymousThread';
import { useAnonymousThreadContext } from './AnonymousThreadProvider';
import { AnonymousThreadRuntimeProvider } from './AnonymousThreadRuntimeProvider';

interface AnonymousChatPanelProps {
  close?: () => void;
}

export const AnonymousChatPanel: FC<AnonymousChatPanelProps> = ({ close }) => {
  // Opening the panel means the visitor is now looking at the reply, so drop the
  // header's unread marker — mirrors AuthenticatedChatDrawer's clearNotification
  // so the marker clears from whichever entry point opened the drawer.
  const { setHasUnreadReply } = useAnonymousThreadContext();
  useEffect(() => {
    setHasUnreadReply(false);
  }, [setHasUnreadReply]);

  return (
    <AnonymousThreadRuntimeProvider>
      <div className="h-full w-full flex flex-col">
        <LLMErrorBoundary onClose={close}>
          <AnonymousThread />
        </LLMErrorBoundary>
      </div>
    </AnonymousThreadRuntimeProvider>
  );
};
