import { ArrowDownIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderResourcesSetDownscaled } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const MultiSetDownscaledAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  // Filter resources that support downscaling
  const supportedResources = rows.filter(
    (resource) =>
      (resource.offering_plugin_options as any)?.supports_downscaling === true,
  );

  const callback = useCallback(async () => {
    if (supportedResources.length === 0) {
      dispatch(
        showErrorResponse(
          { message: 'No resources support downscaling' } as any,
          translate('No resources support downscaling'),
        ),
      );
      return;
    }

    // Group resources by their current downscaled state
    const toDownscale = supportedResources.filter((r) => !r.downscaled);
    const toUndownscale = supportedResources.filter((r) => r.downscaled);

    if (toDownscale.length === 0 && toUndownscale.length === 0) {
      return;
    }

    let actionText = '';
    if (toDownscale.length > 0 && toUndownscale.length === 0) {
      actionText = translate('mark {count} resources as downscaled', {
        count: toDownscale.length,
      });
    } else if (toDownscale.length === 0 && toUndownscale.length > 0) {
      actionText = translate('unmark {count} resources as downscaled', {
        count: toUndownscale.length,
      });
    } else {
      actionText = translate('toggle downscaled status for {count} resources', {
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
        ...toDownscale.map((resource) =>
          marketplaceProviderResourcesSetDownscaled({
            path: { uuid: resource.uuid },
            body: { downscaled: true },
          }),
        ),
        ...toUndownscale.map((resource) =>
          marketplaceProviderResourcesSetDownscaled({
            path: { uuid: resource.uuid },
            body: { downscaled: false },
          }),
        ),
      ]);

      dispatch(
        showSuccess(
          translate(
            'Successfully updated downscaled status for {count} resources',
            { count: supportedResources.length },
          ),
        ),
      );
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error as any,
          translate('Failed to update downscaled status'),
        ),
      );
    }
  }, [dispatch, supportedResources, refetch]);

  if (supportedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Toggle downscaled')}
      action={callback}
      className="text-warning"
      iconNode={<ArrowDownIcon weight="bold" />}
      iconColor="warning"
      staff
    />
  );
};
