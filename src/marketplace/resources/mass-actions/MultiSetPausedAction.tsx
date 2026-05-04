import { PauseIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import {
  marketplaceProviderResourcesSetPaused,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const MultiSetPausedAction = ({ rows, refetch }) => {
  const supportedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          (resource.offering_plugin_options as any)?.supports_pausing === true,
      ),
    [rows],
  );

  const actionText = useMemo(() => {
    const toPause = supportedResources.filter((r) => !r.paused);
    const toUnpause = supportedResources.filter((r) => r.paused);
    if (toPause.length > 0 && toUnpause.length === 0) {
      return translate('pause {count} resources', {
        count: toPause.length,
      });
    } else if (toPause.length === 0 && toUnpause.length > 0) {
      return translate('unpause {count} resources', {
        count: toUnpause.length,
      });
    } else {
      return translate('toggle paused status for {count} resources', {
        count: supportedResources.length,
      });
    }
  }, [supportedResources]);

  const { mutate, isPending } = useBatchMutation<Resource, void>({
    rows: supportedResources,
    refetch,
    mutationFn: (resource) =>
      marketplaceProviderResourcesSetPaused({
        path: { uuid: resource.uuid },
        body: { paused: !resource.paused },
      }),
    successMessage: translate('Resources paused status updated.'),
    renderPartialSuccessMessage: (n) =>
      translate('Successfully updated paused status for {n} resources.', { n }),
    errorMessage: translate('Failed to update paused status.'),
    renderErrorMessage: (n) =>
      translate('Failed to update paused status for {n} resources.', { n }),
    confirmation: {
      title: translate('Perform mass action'),
      body: translate('Are you sure you want to {action}?', {
        action: actionText,
      }),
    },
  });

  if (supportedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Toggle paused')}
      action={mutate}
      disabled={isPending}
      className="text-info"
      iconNode={<PauseIcon weight="bold" />}
      iconColor="info"
      staff
    />
  );
};
