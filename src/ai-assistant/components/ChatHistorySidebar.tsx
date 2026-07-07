import { useAssistantRuntime } from '@assistant-ui/react';
import { PlusIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { chatThreadsArchive, chatThreadsUnarchive } from 'waldur-js-client';

import {
  groupThreadsByDate,
  THREAD_LIST_QUERY_KEY,
  useThreadList,
} from '@/ai-assistant/lib/thread/useThreadList';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { useChatDrawerPreference } from '@/chat/chatDrawerPreferences';
import { MediumIconButton } from '@/core/buttons/IconButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarToggleGraphic } from '@/core/SidebarToggleGraphic';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

import { ThreadListItem } from './ThreadListItem';

export const ChatHistorySidebar: FC = () => {
  const [collapsed, setCollapsed] = useChatDrawerPreference('sidebarCollapsed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { currentThreadId, threadNotifications, getIsRunning } =
    useThreadContext();
  const runtime = useAssistantRuntime();
  const queryClient = useQueryClient();

  const { data: threads, isLoading } = useThreadList({
    searchQuery: searchQuery || undefined,
    isArchived: showArchived,
  });

  const groups = useMemo(() => groupThreadsByDate(threads ?? []), [threads]);

  const handleNewChat = useCallback(() => {
    runtime.threads.switchToNewThread();
  }, [runtime]);

  const handleSwitchThread = useCallback(
    (threadId: string) => {
      if (threadId === currentThreadId) return;
      runtime.threads.switchToThread(threadId);
      // Close history sidebar (toolbar reads DOM state on next toggle)
      document
        .getElementById('kt_drawer')
        ?.removeAttribute('data-history-open');
    },
    [runtime, currentThreadId],
  );

  const handleArchive = useCallback(
    async (threadId: string) => {
      await chatThreadsArchive({ path: { uuid: threadId } });
      queryClient.invalidateQueries({ queryKey: [THREAD_LIST_QUERY_KEY] });
      if (threadId === currentThreadId) {
        runtime.threads.switchToNewThread();
      }
    },
    [queryClient, currentThreadId, runtime],
  );

  const handleUnarchive = useCallback(
    async (threadId: string) => {
      await chatThreadsUnarchive({ path: { uuid: threadId } });
      queryClient.invalidateQueries({ queryKey: [THREAD_LIST_QUERY_KEY] });
    },
    [queryClient],
  );

  return (
    <div
      className={`aui-history-sidebar ${collapsed ? 'aui-history-sidebar--collapsed' : ''}`}
    >
      <div className="aui-history-button-section">
        <div className="aui-history-header">
          {/* Desktop only: collapse toggle (mobile never minimizes) */}
          <span className="d-none d-md-inline-flex">
            <MediumIconButton
              iconNode={
                <span className={collapsed ? 'aui-icon-rotate-180' : ''}>
                  <SidebarToggleGraphic />
                </span>
              }
              tooltip={
                collapsed
                  ? translate('Expand sidebar')
                  : translate('Collapse sidebar')
              }
              onClick={() => setCollapsed(!collapsed)}
              variant="tertiary-ghost"
            />
          </span>
          {!collapsed && (
            <span className="aui-history-header-title">
              {translate('History')}
            </span>
          )}
        </div>
        {collapsed ? (
          <span className="d-none d-md-inline-flex">
            <MediumIconButton
              iconNode={<PlusIcon weight="bold" />}
              tooltip={translate('New chat')}
              onClick={handleNewChat}
              variant="tertiary"
            />
          </span>
        ) : null}
      </div>
      {!collapsed && (
        <div className="d-flex flex-column gap-2">
          <FilterBox
            type="search"
            placeholder={translate('Search chats...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="btn btn-tertiary aui-history-new-chat"
            onClick={handleNewChat}
          >
            <PlusIcon weight="bold" size={20} />
            {translate('New chat')}
          </button>
        </div>
      )}
      {!collapsed && (
        <>
          <Nav variant="tabs" className="nav-line-tabs w-100">
            <Nav.Item className="flex-fill text-center">
              <Nav.Link
                as="button"
                active={!showArchived}
                onClick={() => setShowArchived(false)}
                className="w-100"
              >
                {translate('Active')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-fill text-center">
              <Nav.Link
                as="button"
                active={showArchived}
                onClick={() => setShowArchived(true)}
                className="w-100"
              >
                {translate('Archived')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <div className="aui-history-list">
            {isLoading ? (
              <LoadingSpinner />
            ) : groups.length === 0 ? (
              <div className="aui-history-empty">
                {searchQuery
                  ? translate('No chats found')
                  : showArchived
                    ? translate('No archived chats')
                    : translate('No chat history yet')}
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="aui-history-group">
                  <div className="fw-bold fs-7 text-muted">{group.label}</div>
                  {group.threads.map((thread) => {
                    const isActive = thread.uuid === currentThreadId;
                    const isRunning =
                      !showArchived && getIsRunning(thread.uuid!) && !isActive;
                    const hasNotification =
                      !showArchived && threadNotifications.has(thread.uuid!);

                    return (
                      <ThreadListItem
                        key={thread.uuid}
                        thread={thread}
                        isActive={isActive}
                        isRunning={isRunning}
                        hasNotification={hasNotification}
                        onSwitch={handleSwitchThread}
                        onAction={
                          showArchived ? handleUnarchive : handleArchive
                        }
                        isArchived={showArchived}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
