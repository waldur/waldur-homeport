import {
  ArrowCounterClockwiseIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { FC, forwardRef } from 'react';
import { ThreadSession } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ThreadItemMenuProps {
  threadId: string;
  onAction: (threadId: string) => void;
  isArchived?: boolean;
}

/**
 * forwardRef for the asChild Trigger below — see ActionsDropdown.tsx's
 * TableDropdownToggle for the general requirement. A custom Toggle (rather
 * than reusing TableDropdownToggle's icon-only variant) exists only because
 * that variant doesn't forward a custom className, and this trigger needs
 * aui-history-item-menu-trigger (src/metronic/sass/custom/ai-assistant/
 * _history-sidebar.scss — shows the trigger on row hover).
 */
const ThreadItemMenuToggle = forwardRef<HTMLButtonElement>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className={classNames(
      'btn dropdown-toggle btn-text-secondary btn-icon no-arrow btn-sm',
      'aui-history-item-menu-trigger',
    )}
    {...props}
  >
    <DotsThreeVerticalIcon weight="bold" size={22} />
  </button>
));
ThreadItemMenuToggle.displayName = 'ThreadItemMenuToggle';

const ThreadItemMenu: FC<ThreadItemMenuProps> = ({
  threadId,
  onAction,
  isArchived,
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation wrapper
    <div className="aui-history-item-menu" onClick={(e) => e.stopPropagation()}>
      <RadixDropdownMenu.Root modal={false}>
        <RadixDropdownMenu.Trigger asChild>
          <ThreadItemMenuToggle />
        </RadixDropdownMenu.Trigger>
        <RadixDropdownMenu.Portal>
          <RadixDropdownMenu.Content
            align="end"
            sideOffset={2}
            className="dropdown-menu show position-static"
          >
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
          </RadixDropdownMenu.Content>
        </RadixDropdownMenu.Portal>
      </RadixDropdownMenu.Root>
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
