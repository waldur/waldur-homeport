import { BellSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { UserAction } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ActionContext } from './ActionContext';
import { PrimaryActionInfo, usePendingActionActions } from './actions';
import { DueDateBadge } from './DueDateBadge';
import { UserPendingActionType } from './types';
import { PENDING_ACTION_COMPONENTS, getActionTypeLabel } from './utils';

// Primary action button component
const PrimaryActionButton: FC<{ action: PrimaryActionInfo }> = ({ action }) => {
  const IconComponent = action.icon;
  return (
    <button
      type="button"
      className="btn btn-sm btn-light-primary"
      onClick={action.handler}
    >
      <IconComponent weight="bold" size={14} />
      <span className="ms-1">{action.label}</span>
    </button>
  );
};

export const PendingActionAlertItem: FC<{
  row: UserAction;
  refetch?: () => void;
}> = ({ row, refetch }) => {
  const { primaryAction, remainingActions } = usePendingActionActions(
    row,
    refetch,
  );

  // Map urgency to AlertItem variants
  const getAlertVariant = (urgency: string): 'info' | 'warning' | 'error' => {
    switch (urgency) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'info';
    }
  };

  const extendedRow = row;

  const MessageComponent =
    PENDING_ACTION_COMPONENTS[row.action_type as UserPendingActionType];

  // Use resource name as title if available, otherwise fall back to row title
  const displayTitle =
    extendedRow.resource_name || row.related_object_name || row.title;

  return (
    <AlertItem
      variant={getAlertVariant(row.urgency || 'low')}
      title={
        <div className="d-flex align-items-center gap-2">
          {displayTitle}
          {row.is_effectively_silenced && (
            <Tip
              label={
                row.is_silenced
                  ? translate('This action has been permanently silenced')
                  : translate('This action has been temporarily silenced')
              }
              id="silenced-action-tooltip"
            >
              <Badge variant="secondary" size="sm" pill onlyIcon>
                <BellSlashIcon size={12} weight="bold" />
              </Badge>
            </Tip>
          )}
        </div>
      }
      titleAfter={<DueDateBadge dueDate={row.due_date} />}
      body={
        <div>
          <Badge variant="secondary" size="sm" className="mb-2">
            {getActionTypeLabel(row.action_type)}
          </Badge>
          {MessageComponent ? (
            <MessageComponent row={extendedRow} />
          ) : (
            <>
              {row.description && (
                <div className="text-muted small mb-2">{row.description}</div>
              )}
              <ActionContext row={row} />
            </>
          )}
          {row.silenced_until && (
            <div className="text-muted mt-2 small">
              <BellSlashIcon size={14} className="me-1" weight="bold" />
              {translate('Silenced until {date}', {
                date: new Date(row.silenced_until).toLocaleDateString(),
              })}
            </div>
          )}
        </div>
      }
      actions={
        <div className="d-flex align-items-center gap-2">
          {primaryAction && <PrimaryActionButton action={primaryAction} />}
          {remainingActions.length > 0 && (
            <ActionsDropdown
              row={row}
              actions={remainingActions}
              labeled
              variant="text-secondary"
              drop="down"
            />
          )}
        </div>
      }
      className={row.is_effectively_silenced ? 'opacity-75' : undefined}
    />
  );
};
