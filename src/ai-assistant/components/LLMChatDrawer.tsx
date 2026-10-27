import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  ListIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { AIDisclosureBanner } from '@/ai-assistant/components/AIDisclosureDialog';
import { ChatHistorySidebar } from '@/ai-assistant/components/ChatHistorySidebar';
import { LLMErrorBoundary } from '@/ai-assistant/components/LLMErrorBoundary';
import { Thread } from '@/ai-assistant/components/Thread';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { ThreadRuntimeProvider } from '@/ai-assistant/logic/ThreadRuntimeProvider';
import {
  acknowledgeDisclosure,
  isAnonymousVisitor,
  isDisclosureAcknowledged,
} from '@/ai-assistant/utils';
import { useChatDrawerPreference } from '@/chat/chatDrawerPreferences';
import { useDrawer } from '@/drawer/actions';
import { DrawerCloseButton } from '@/drawer/DrawerCloseButton';
import { useDrawerExpand } from '@/drawer/useDrawerExpand';
import { translate } from '@/i18n';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useUser } from '@/workspace/hooks';

interface LLMChatDrawerProps {
  close?: () => void;
}

export const LLMChatDrawerToolbar: FC<{ close: () => void }> = ({ close }) => {
  const { expanded, toggle: toggleExpand } = useDrawerExpand();
  const { hasNewMessages } = useThreadContext();
  const { historyOpen, setHistoryOpen } = useDrawer();
  // History sidebar only makes sense on the AI tab; matrix has its own room
  // list. Subscribe to the shared pref so the toolbar updates as the user
  // toggles tabs inside UnifiedChatDrawer.
  const user = useUser();
  // The anonymous visitor panel has no full-screen layout and no history
  // sidebar, so its toolbar reduces to the close button. Same gate as
  // UnifiedChatDrawer ('anonymous' mode + no user = visitor).
  const isAnonymous = isAnonymousVisitor(user);
  const [activeTab] = useChatDrawerPreference('activeTab');
  const showHistoryToggle = !isAnonymous && activeTab === 'ai';

  const toggleHistory = useCallback(
    () => setHistoryOpen(!historyOpen),
    [historyOpen, setHistoryOpen],
  );

  // Close history sidebar when resizing from tablet to desktop
  useEffect(() => {
    if (!historyOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setHistoryOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [historyOpen, setHistoryOpen]);

  return (
    <>
      {/* Desktop: expand/collapse (authenticated only — the anon panel has no
          full-screen layout) */}
      {!isAnonymous && (
        <span className="hidden lg:inline-flex relative">
          <BaseButton
            iconNode={
              expanded ? (
                <ArrowsInSimpleIcon weight="bold" />
              ) : (
                <ArrowsOutSimpleIcon weight="bold" />
              )
            }
            tooltip={
              expanded
                ? translate('Collapse to panel')
                : translate('Expand to full screen')
            }
            onClick={toggleExpand}
            variant="tertiary-ghost"
            tooltipSide="bottom"
            size="md"
          />
          {hasNewMessages && !expanded && (
            <HeaderButtonBullet className="pointer-events-none" />
          )}
        </span>
      )}
      {showHistoryToggle && (
        <>
          {/* Tablet: compact history toggle */}
          <span className="hidden md:inline-flex lg:hidden">
            <BaseButton
              iconNode={<ListIcon weight="bold" />}
              tooltip={translate('History')}
              onClick={toggleHistory}
              variant="tertiary-ghost"
              tooltipSide="bottom"
              size="md"
            />
          </span>
          {/* Mobile: large history toggle */}
          <span className="inline-flex md:hidden">
            <BaseButton
              iconNode={<ListIcon weight="bold" />}
              tooltip={translate('History')}
              onClick={toggleHistory}
              variant="tertiary-ghost"
              tooltipSide="bottom"
              size="lg"
            />
          </span>
        </>
      )}
      <DrawerCloseButton close={close} />
    </>
  );
};

export const LLMChatDrawer: React.FC<LLMChatDrawerProps> = ({ close }) => {
  const [showDisclosure, setShowDisclosure] = useState(
    () => !isDisclosureAcknowledged(),
  );

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
    <ThreadRuntimeProvider>
      <div className="aui-chat-drawer">
        <ChatHistorySidebar />
        <div className="aui-chat-main grow flex flex-col overflow-hidden">
          <LLMErrorBoundary onClose={close}>
            <Thread />
          </LLMErrorBoundary>
        </div>
      </div>
    </ThreadRuntimeProvider>
  );
};
