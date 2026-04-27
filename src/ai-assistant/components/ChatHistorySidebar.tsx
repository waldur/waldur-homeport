import { useAssistantRuntime } from '@assistant-ui/react';
import {
  ArrowCounterClockwiseIcon,
  DotsThreeVerticalIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Dropdown, Nav } from 'react-bootstrap';
import { chatThreadsArchive, chatThreadsUnarchive } from 'waldur-js-client';

import {
  groupThreadsByDate,
  THREAD_LIST_QUERY_KEY,
  useThreadList,
} from '@/ai-assistant/lib/thread/useThreadList';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { MediumIconButton } from '@/core/buttons/IconButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarToggleGraphic } from '@/core/SidebarToggleGraphic';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ThreadItemMenuProps {
  threadId: string;
  onAction: (threadId: string) => void;
  isArchived?: boolean;
}

const ThreadItemMenu: FC<ThreadItemMenuProps> = ({
  threadId,
  onAction,
  isArchived,
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation wrapper
    <div className="aui-history-item-menu" onClick={(e) => e.stopPropagation()}>
      <Dropdown drop="down" align="end">
        <Dropdown.Toggle
          variant="text-secondary"
          className="btn-icon no-arrow aui-history-item-menu-trigger"
          size="sm"
        >
          <DotsThreeVerticalIcon weight="bold" size={22} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <ActionItem
            title={isArchived ? translate('Unarchive') : translate('Archive')}
            action={() => onAction(threadId)}
            iconNode={
              isArchived ? (
                <ArrowCounterClockwiseIcon weight="bold" />
              ) : (
                <TrashIcon weight="bold" />
              )
            }
            iconColor={isArchived ? 'gray-400' : 'danger'}
            className={isArchived ? undefined : 'text-danger'}
          />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export const ChatHistorySidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
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
    runtime.switchToNewThread();
  }, [runtime]);

  const handleSwitchThread = useCallback(
    (threadId: string) => {
      if (threadId === currentThreadId) return;
      runtime.switchToThread(threadId);
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
        runtime.switchToNewThread();
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
              {translate('Chat history')}
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
          <button
            className="btn btn-tertiary aui-history-new-chat"
            onClick={handleNewChat}
          >
            <PlusIcon weight="bold" size={20} />
            {translate('New chat')}
          </button>
          <FilterBox
            type="search"
            placeholder={translate('Search chats...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                      <button
                        key={thread.uuid}
                        className={`aui-history-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSwitchThread(thread.uuid!)}
                      >
                        <span className="aui-history-item-title">
                          {thread.name || translate('Untitled')}
                        </span>
                        {isRunning && (
                          <span className="aui-history-item-running" />
                        )}
                        {!isRunning && hasNotification && (
                          <span className="aui-history-item-dot" />
                        )}
                        <ThreadItemMenu
                          threadId={thread.uuid!}
                          onAction={
                            showArchived ? handleUnarchive : handleArchive
                          }
                          isArchived={showArchived}
                        />
                      </button>
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
