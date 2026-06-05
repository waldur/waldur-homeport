import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  ListIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { AIDisclosureBanner } from '@/ai-assistant/components/AIDisclosureDialog';
import { ChatHistorySidebar } from '@/ai-assistant/components/ChatHistorySidebar';
import { LLMErrorBoundary } from '@/ai-assistant/components/LLMErrorBoundary';
import { Thread } from '@/ai-assistant/components/Thread';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { ThreadRuntimeProvider } from '@/ai-assistant/logic/ThreadRuntimeProvider';
import {
  acknowledgeDisclosure,
  isDisclosureAcknowledged,
} from '@/ai-assistant/utils';
import { useChatDrawerPreference } from '@/chat/chatDrawerPreferences';
import { IconButton, MediumIconButton } from '@/core/buttons/IconButton';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { useLayout } from '@/metronic/layout/core';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';

interface LLMChatDrawerProps {
  close?: () => void;
}

const DRAWER_WIDTH_DEFAULT = '800px';

const getExpandedWidth = () => {
  const isMinimized =
    document.body.getAttribute('data-kt-aside-minimize') === 'on';
  const asideWidth = isMinimized ? 75 : 300;
  return `calc(100% - ${asideWidth}px - 8px)`;
};

const setDrawerWidth = (width: string) => {
  const drawer = document.getElementById('kt_drawer');
  if (drawer) {
    drawer.style.width = width;
  }
};

const AI_DRAWER_CLASS = 'ai-chat-drawer-active';

/** Reset all AI drawer DOM state to defaults. */
export const resetDrawerDOM = () => {
  const drawer = document.getElementById('kt_drawer');
  if (!drawer) return;
  drawer.classList.remove(AI_DRAWER_CLASS);
  drawer.removeAttribute('data-expanded');
  drawer.removeAttribute('data-history-open');
  drawer.style.width = '';
};

export const LLMChatDrawerToolbar: FC<{ close: () => void }> = ({ close }) => {
  const [expanded, setExpanded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { hasNewMessages } = useThreadContext();
  const { closeDrawer } = useDrawer();
  const { config } = useLayout();
  const isFirstAsideChange = useRef(true);
  // History sidebar only makes sense on the AI tab; matrix has its own room
  // list. Subscribe to the shared pref so the toolbar updates as the user
  // toggles tabs inside UnifiedChatDrawer.
  const [activeTab] = useChatDrawerPreference('activeTab');
  const showHistoryToggle = activeTab === 'ai';

  // Close the drawer when the main aside minimize state flips. The drawer's
  // layout is anchored to the main content area's width; when that changes,
  // closing is cleaner than trying to reflow. Same pattern as the
  // impersonation-change handler in LLMChatDrawerToggle.
  useEffect(() => {
    if (isFirstAsideChange.current) {
      isFirstAsideChange.current = false;
      return;
    }
    closeDrawer();
  }, [config.aside.minimized, closeDrawer]);

  const toggleExpand = useCallback(() => {
    const drawer = document.getElementById('kt_drawer');
    const isCurrentlyExpanded = drawer?.dataset.expanded === 'true';
    const next = !isCurrentlyExpanded;
    setExpanded(next);
    setDrawerWidth(next ? getExpandedWidth() : DRAWER_WIDTH_DEFAULT);
    if (drawer) drawer.dataset.expanded = String(next);
  }, []);

  const toggleHistory = useCallback(() => {
    const drawer = document.getElementById('kt_drawer');
    const isOpen = drawer?.dataset.historyOpen === 'true';
    const next = !isOpen;
    setHistoryOpen(next);
    if (drawer) {
      if (next) {
        drawer.dataset.historyOpen = 'true';
      } else {
        drawer.removeAttribute('data-history-open');
      }
    }
  }, []);

  // Collapse expanded view immediately on any window resize
  useEffect(() => {
    if (!expanded) return;

    const collapse = () => {
      setExpanded(false);
      setDrawerWidth(DRAWER_WIDTH_DEFAULT);
      const drawer = document.getElementById('kt_drawer');
      if (drawer) drawer.dataset.expanded = 'false';
    };

    window.addEventListener('resize', collapse);
    return () => {
      window.removeEventListener('resize', collapse);
    };
  }, [expanded]);

  // Close history sidebar when resizing from tablet to desktop
  useEffect(() => {
    if (!historyOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setHistoryOpen(false);
        const drawer = document.getElementById('kt_drawer');
        drawer?.removeAttribute('data-history-open');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [historyOpen]);

  useEffect(() => {
    return () => {
      // Only clean up what the toolbar owns — the class is LLMChatDrawer's responsibility
      setDrawerWidth(DRAWER_WIDTH_DEFAULT);
      const drawer = document.getElementById('kt_drawer');
      drawer?.removeAttribute('data-expanded');
      drawer?.removeAttribute('data-history-open');
    };
  }, []);

  return (
    <>
      {/* Desktop: expand/collapse */}
      <span className="d-none d-lg-inline-flex position-relative">
        <MediumIconButton
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
          tooltipPlacement="bottom"
        />
        {hasNewMessages && !expanded && (
          <HeaderButtonBullet className="pe-none" />
        )}
      </span>
      {showHistoryToggle && (
        <>
          {/* Tablet: compact history toggle */}
          <span className="d-none d-md-inline-flex d-lg-none">
            <MediumIconButton
              iconNode={<ListIcon weight="bold" />}
              tooltip={translate('History')}
              onClick={toggleHistory}
              variant="tertiary-ghost"
              tooltipPlacement="bottom"
            />
          </span>
          {/* Mobile: large history toggle */}
          <span className="d-inline-flex d-md-none">
            <IconButton
              iconNode={<ListIcon weight="bold" />}
              tooltip={translate('History')}
              onClick={toggleHistory}
              variant="tertiary-ghost"
              tooltipPlacement="bottom"
            />
          </span>
        </>
      )}
      {/* Tablet+Desktop: close */}
      <span className="d-none d-md-inline-flex">
        <MediumIconButton
          iconNode={<XIcon weight="bold" />}
          tooltip={translate('Close')}
          onClick={close}
          variant="tertiary-ghost"
          tooltipPlacement="bottom"
        />
      </span>
      {/* Mobile only: close (large) */}
      <span className="d-inline-flex d-md-none">
        <IconButton
          iconNode={<XIcon weight="bold" />}
          tooltip={translate('Close')}
          onClick={close}
          variant="tertiary-ghost"
          tooltipPlacement="bottom"
        />
      </span>
    </>
  );
};

let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;

export const LLMChatDrawer: React.FC<LLMChatDrawerProps> = ({ close }) => {
  const [showDisclosure, setShowDisclosure] = useState(
    () => !isDisclosureAcknowledged(),
  );

  useEffect(() => {
    if (cleanupTimeout !== null) {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = null;
    }

    // Ensure clean state on mount (e.g. after impersonation change)
    setDrawerWidth(DRAWER_WIDTH_DEFAULT);
    document.getElementById('kt_drawer')?.removeAttribute('data-expanded');

    return () => {
      const drawer = document.getElementById('kt_drawer');
      if (drawer?.classList.contains('drawer-on')) {
        resetDrawerDOM();
      } else {
        // Drawer already sliding out — delay class removal so CSS transition finishes
        cleanupTimeout = setTimeout(() => {
          resetDrawerDOM();
          cleanupTimeout = null;
        }, 350);
      }
    };
  }, []);

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
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <LLMErrorBoundary onClose={close}>
            <Thread />
          </LLMErrorBoundary>
        </div>
      </div>
    </ThreadRuntimeProvider>
  );
};
