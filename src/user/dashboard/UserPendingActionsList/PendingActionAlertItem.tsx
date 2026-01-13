import { BellSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { UserAction } from 'waldur-js-client';

import { AlertItem } from '@waldur/core/AlertItem';
import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ActionContext } from './ActionContext';
import { usePendingActionActions } from './actions';
import { ExtendedUserAction, UserPendingActionType } from './types';
import { PENDING_ACTION_COMPONENTS } from './utils';

export const PendingActionAlertItem: FC<{
  row: UserAction;
  refetch?: () => void;
}> = ({ row, refetch }) => {
  const actions = usePendingActionActions(row, refetch);

  // Map action_type to valid AlertItem variants
  const getAlertVariant = (
    actionType: string,
  ): 'info' | 'warning' | 'error' => {
    switch (actionType) {
      case 'warning':
        return 'warning';
      case 'error':
      case 'danger':
        return 'error';
      default:
        return 'info';
    }
  };

  const MessageComponent =
    PENDING_ACTION_COMPONENTS[row.action_type as UserPendingActionType];

  return (
    <AlertItem
      variant={getAlertVariant(row.action_type || 'info')}
      title={
        <div className="d-flex align-items-center gap-2">
          {row.title}
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
      titleAfter={
        <Badge
          variant={
            { info: 'default', warning: 'warning', error: 'danger' }[
              row.action_type as string
            ] || 'default'
          }
          size="sm"
          pill
          outline
        >
          {formatDateTime(row.due_date)}
        </Badge>
      }
      body={
        <div>
          {MessageComponent ? (
            <MessageComponent row={row as unknown as ExtendedUserAction} />
          ) : (
            <>
              {row.description}
              <ActionContext row={row} />
            </>
          )}
          {row.silenced_until && (
            <div className="text-muted mt-1 small">
              <BellSlashIcon size={14} className="me-1" weight="bold" />
              {translate('Silenced until')} {formatDateTime(row.silenced_until)}
            </div>
          )}
        </div>
      }
      actions={
        <ActionsDropdown
          row={row}
          actions={actions}
          labeled
          variant="text-secondary"
          drop="down"
        />
      }
      className={row.is_effectively_silenced ? 'opacity-75' : undefined}
    />
  );
};
