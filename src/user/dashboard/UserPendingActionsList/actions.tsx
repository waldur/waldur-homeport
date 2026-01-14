import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';
import { UserAction, userActionsExecuteAction } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { SilenceAction } from './SilenceAction';
import { CorrectiveAction, ExtendedUserAction } from './types';
import { UnsilenceAction } from './UnsilenceAction';
import { ACTION_CATEGORY_CONFIG } from './utils';

const RenewAllocationDialog = lazyComponent(() =>
  import('@waldur/marketplace/resources/renew-allocation/RenewAllocationDialog').then(
    (m) => ({
      default: m.RenewAllocationDialog,
    }),
  ),
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

export const usePendingActionActions = (
  row: UserAction,
  refetch?: () => void,
) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const actions = [];

  // Add corrective actions from backend
  if (row.corrective_actions && Array.isArray(row.corrective_actions)) {
    row.corrective_actions.forEach((action) => {
      actions.push(createDynamicAction(action, row, refetch, router, dispatch));
    });
  }

  // Add conditional silence/unsilence action
  if (row.is_effectively_silenced) {
    // Show unmute action for silenced actions
    actions.push(() => <UnsilenceAction row={row} refetch={refetch} />);
  } else {
    // Show mute action for non-silenced actions
    actions.push(() => <SilenceAction row={row} refetch={refetch} />);
  }

  return actions;
};
