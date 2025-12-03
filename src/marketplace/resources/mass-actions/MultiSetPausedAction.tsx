import { PauseIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderResourcesSetPaused } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const MultiSetPausedAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  // Filter resources that support pausing
  const supportedResources = rows.filter(
    (resource) =>
      (resource.offering_plugin_options as any)?.supports_pausing === true,
  );

  const callback = useCallback(async () => {
    if (supportedResources.length === 0) {
      dispatch(
        showErrorResponse(
          { message: 'No resources support pausing' } as any,
          translate('No resources support pausing'),
        ),
      );
      return;
    }

    // Group resources by their current paused state
    const toPause = supportedResources.filter((r) => !r.paused);
    const toUnpause = supportedResources.filter((r) => r.paused);

    if (toPause.length === 0 && toUnpause.length === 0) {
      return;
    }

    let actionText = '';
    if (toPause.length > 0 && toUnpause.length === 0) {
      actionText = translate('pause {count} resources', {
        count: toPause.length,
      });
    } else if (toPause.length === 0 && toUnpause.length > 0) {
      actionText = translate('unpause {count} resources', {
        count: toUnpause.length,
      });
    } else {
      actionText = translate('toggle paused status for {count} resources', {
        count: supportedResources.length,
      });
    }

    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to {action}?', {
          action: actionText,
        }),
      );
    } catch {
      return;
    }

    try {
      await Promise.all([
        ...toPause.map((resource) =>
          marketplaceProviderResourcesSetPaused({
            path: { uuid: resource.uuid },
            body: { paused: true },
          }),
        ),
        ...toUnpause.map((resource) =>
          marketplaceProviderResourcesSetPaused({
            path: { uuid: resource.uuid },
            body: { paused: false },
          }),
        ),
      ]);

      dispatch(
        showSuccess(
          translate(
            'Successfully updated paused status for {count} resources',
            { count: supportedResources.length },
          ),
        ),
      );
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error as any,
          translate('Failed to update paused status'),
        ),
      );
    }
  }, [dispatch, supportedResources, refetch]);

  if (supportedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Toggle paused')}
      action={callback}
      className="text-info"
      iconNode={<PauseIcon weight="bold" />}
      iconColor="info"
      staff
    />
  );
};
