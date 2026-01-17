import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';
import { UserAction, userActionsExecuteAction } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { SilenceAction } from './SilenceAction';
import {
  ActionCategory,
  CorrectiveAction,
  ExtendedUserAction,
  UserPendingActionType,
} from './types';
import { UnsilenceAction } from './UnsilenceAction';
import { ACTION_CATEGORY_CONFIG } from './utils';

const RenewAllocationDialog = lazyComponent(() =>
  import('@waldur/marketplace/resources/renew-allocation/RenewAllocationDialog').then(
    (m) => ({
      default: m.RenewAllocationDialog,
    }),
  ),
);

const PendingOrderDetailsDialog = lazyComponent(() =>
  import('./PendingOrderDetailsDialog').then((m) => ({
    default: m.PendingOrderDetailsDialog,
  })),
);

// Create action handler for corrective actions
const createActionHandler = (
  action: CorrectiveAction,
  row: UserAction,
  refetch?: () => void,
  router?: any,
  dispatch?: any,
) => {
  return async () => {
    // Special handling for Renew Resource action - open dialog directly
    if (action.label === 'Renew Resource') {
      const extRow = row as unknown as ExtendedUserAction;
      dispatch?.(
        openModalDialog(RenewAllocationDialog, {
          size: 'xl',
          fullscreen: 'lg-down',
          resolve: {
            resource_uuid: extRow.resource_uuid,
            refetch,
          },
        }),
      );
      return;
    }

    try {
      if (action.api_endpoint) {
        // Execute via backend API
        await userActionsExecuteAction({
          path: { uuid: row.uuid as any },
          body: { action_label: action.label },
        });
        dispatch?.(showSuccess(translate('Action executed successfully.')));
        refetch?.();
      } else {
        // Handle navigation using route-based approach only
        if (action.route_name && router) {
          router.stateService.go(action.route_name, action.route_params || {});
        }
      }
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch?.(
          showErrorResponse(
            e,
            translate('Action not found or no longer available.'),
          ),
        );
      } else {
        dispatch?.(
          showErrorResponse(e, translate('Unable to execute action.')),
        );
      }
    }
  };
};

// Create dynamic action component from corrective action
const createDynamicAction = (
  action: CorrectiveAction,
  row: UserAction,
  refetch?: () => void,
  router?: any,
  dispatch?: any,
) => {
  const config =
    ACTION_CATEGORY_CONFIG[
      action.category as keyof typeof ACTION_CATEGORY_CONFIG
    ] || ACTION_CATEGORY_CONFIG.view;
  const IconComponent = config.icon;

  return () => (
    <ActionItem
      title={action.label}
      action={createActionHandler(action, row, refetch, router, dispatch)}
      iconNode={<IconComponent weight="bold" />}
    />
  );
};

export interface PrimaryActionInfo {
  label: string;
  handler: () => void;
  icon: React.ComponentType<any>;
  variant: string;
}

// Find the best primary action based on action type
const findPrimaryAction = (
  actionType: string,
  correctiveActions: CorrectiveAction[],
): CorrectiveAction | null => {
  if (!correctiveActions || correctiveActions.length === 0) {
    return null;
  }

  // For expiring resources, prefer "extend" category (Renew Resource)
  if (actionType === UserPendingActionType.EXPIRING_RESOURCE) {
    const extendAction = correctiveActions.find(
      (a) => a.category === ActionCategory.EXTEND,
    );
    if (extendAction) return extendAction;
  }

  // For pending orders, we handle it separately with a Review dialog
  // So we don't select a primary corrective action here
  if (actionType === UserPendingActionType.PENDING_ORDER) {
    return null;
  }

  // Fallback: first non-view action, or first action
  const nonViewAction = correctiveActions.find(
    (a) => a.category !== ActionCategory.VIEW,
  );
  return nonViewAction || correctiveActions[0];
};

export const usePendingActionActions = (
  row: UserAction,
  refetch?: () => void,
): {
  primaryAction: PrimaryActionInfo | null;
  remainingActions: Array<() => JSX.Element>;
} => {
  const router = useRouter();
  const dispatch = useDispatch();

  const correctiveActions = (row.corrective_actions ||
    []) as CorrectiveAction[];
  const extendedRow = row as unknown as ExtendedUserAction;

  // Build primary action info based on action type
  let primaryAction: PrimaryActionInfo | null = null;
  let usedCorrectiveAction: CorrectiveAction | null = null;

  // Special handling for pending orders - show Review button
  if (row.action_type === UserPendingActionType.PENDING_ORDER) {
    primaryAction = {
      label: translate('Review'),
      handler: () => {
        dispatch(
          openModalDialog(PendingOrderDetailsDialog, {
            size: 'lg',
            resolve: {
              row: extendedRow,
              refetch,
            },
          }),
        );
      },
      icon: ClipboardTextIcon,
      variant: 'warning',
    };
  } else {
    // For other action types, find the best primary action from corrective actions
    usedCorrectiveAction = findPrimaryAction(
      row.action_type,
      correctiveActions,
    );

    if (usedCorrectiveAction) {
      const config =
        ACTION_CATEGORY_CONFIG[
          usedCorrectiveAction.category as keyof typeof ACTION_CATEGORY_CONFIG
        ] || ACTION_CATEGORY_CONFIG.view;

      primaryAction = {
        label: usedCorrectiveAction.label,
        handler: createActionHandler(
          usedCorrectiveAction,
          row,
          refetch,
          router,
          dispatch,
        ),
        icon: config.icon,
        variant: config.variant,
      };
    }
  }

  // Build remaining actions array (all corrective actions not used as primary)
  const remainingActions: Array<() => JSX.Element> = [];

  correctiveActions.forEach((action) => {
    // Skip the action used as primary (if any)
    if (usedCorrectiveAction && action.label === usedCorrectiveAction.label) {
      return;
    }
    remainingActions.push(
      createDynamicAction(action, row, refetch, router, dispatch),
    );
  });

  // Add conditional silence/unsilence action
  if (row.is_effectively_silenced) {
    remainingActions.push(() => (
      <UnsilenceAction row={row} refetch={refetch} />
    ));
  } else {
    remainingActions.push(() => <SilenceAction row={row} refetch={refetch} />);
  }

  return { primaryAction, remainingActions };
};
