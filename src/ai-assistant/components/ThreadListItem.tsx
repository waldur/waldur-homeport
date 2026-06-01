import {
  ArrowCounterClockwiseIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ThreadSession } from 'waldur-js-client';

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

interface ThreadListItemProps {
  thread: ThreadSession;
  isActive: boolean;
  isRunning: boolean;
  hasNotification: boolean;
  onSwitch: (threadId: string) => void;
  onAction: (threadId: string) => void;
  isArchived: boolean;
}

export const ThreadListItem: FC<ThreadListItemProps> = ({
  thread,
  isActive,
  isRunning,
  hasNotification,
  onSwitch,
  onAction,
  isArchived,
}) => (
  <div
    className={`aui-history-item ${isActive ? 'active' : ''}`}
    data-testid="thread-list-item"
  >
    <button
      type="button"
      className="aui-history-item-main"
      onClick={() => onSwitch(thread.uuid!)}
    >
      <span className="aui-history-item-title">
        {thread.name || translate('Untitled')}
      </span>
      {isRunning && <span className="aui-history-item-running" />}
      {!isRunning && hasNotification && (
        <span className="aui-history-item-dot" />
      )}
    </button>
    <ThreadItemMenu
      threadId={thread.uuid!}
      onAction={onAction}
      isArchived={isArchived}
    />
  </div>
);
