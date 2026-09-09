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

// @radix-ui/react-dialog and @radix-ui/react-dropdown-menu each bundle
// their own separate nested copy of @radix-ui/react-focus-scope (different
// node_modules paths despite matching version numbers), so they don't
// coordinate focus with each other. This menu only ever renders inside the
// content drawer's Dialog (ChatHistorySidebar → LLMChatDrawer → #kt_drawer),
// whose own focus trap is active while the drawer is open — the instant
// this Trigger's default document.body portal tries to move focus into its
// portaled Content, the Dialog's focus trap (via a DOM `contains()` check
// against its own container, which the default portal escapes) snaps focus
// straight back to whatever was focused before, and DropdownMenu reads that
// as "focus left me" and closes itself in the same tick — reported live as
// "opens and instantly closes." Anchoring the portal back inside #kt_drawer
// keeps the menu's content within the Dialog's own focus boundary. Falls
// back to Radix's own default (document.body) wherever the drawer isn't
// present — Storybook/tests that don't render the real layout shell.
const getThreadItemMenuPortalContainer = () =>
  document.getElementById('kt_drawer') ?? undefined;

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
        <RadixDropdownMenu.Portal
          container={getThreadItemMenuPortalContainer()}
        >
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
