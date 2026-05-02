import { ArrowDownIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { marketplaceProviderResourcesSetDownscaled } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const MultiSetDownscaledAction = ({ rows, refetch }) => {
  // Filter resources that support downscaling
  const supportedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          (resource.offering_plugin_options as any)?.supports_downscaling ===
          true,
      ),
    [rows],
  );

  const actionText = useMemo(() => {
    const toDownscale = supportedResources.filter((r) => !r.downscaled);
    const toUndownscale = supportedResources.filter((r) => r.downscaled);
    if (toDownscale.length > 0 && toUndownscale.length === 0) {
      return translate('mark {count} resources as downscaled', {
        count: toDownscale.length,
      });
    } else if (toDownscale.length === 0 && toUndownscale.length > 0) {
      return translate('unmark {count} resources as downscaled', {
        count: toUndownscale.length,
      });
    } else {
      return translate('toggle downscaled status for {count} resources', {
        count: supportedResources.length,
      });
    }
  }, [supportedResources]);

  const { mutate, isPending } = useBatchMutation<any, void>({
    rows: supportedResources,
    refetch,
    mutationFn: (resource) =>
      marketplaceProviderResourcesSetDownscaled({
        path: { uuid: resource.uuid },
        body: { downscaled: !resource.downscaled },
      }),
    successMessage: translate('Resources downscaled status updated.'),
    renderPartialSuccessMessage: (n) =>
      translate('Successfully updated downscaled status for {n} resources.', {
        n,
      }),
    errorMessage: translate('Failed to update downscaled status.'),
    renderErrorMessage: (n) =>
      translate('Failed to update downscaled status for {n} resources.', { n }),
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
      title={translate('Toggle downscaled')}
      action={mutate}
      disabled={isPending}
      className="text-warning"
      iconNode={<ArrowDownIcon weight="bold" />}
      iconColor="warning"
      staff
    />
  );
};
