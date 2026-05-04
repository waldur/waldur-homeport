import { LinkBreakIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { marketplaceResourcesUnlink, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const MultiUnlinkAction = ({ rows, refetch }) => {
  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          resource.state === 'Erred' &&
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.UNLINK,
          ),
      ),
    [rows],
  );

  const { mutate, isPending } = useBatchMutation<Resource, void>({
    rows: permittedResources,
    refetch,
    mutationFn: (resource) =>
      marketplaceResourcesUnlink({ path: { uuid: resource.uuid } }),
    successMessage: translate('Resources have been unlinked.'),
    renderPartialSuccessMessage: (count) =>
      translate('{count} resources have been unlinked.', { count }),
    errorMessage: translate('Unable to unlink resources.'),
    renderErrorMessage: (count) =>
      translate('{count} resources could not be unlinked.', { count }),
    confirmation: {
      title: translate('Perform mass action'),
      body: translate(
        'Are you sure you want to unlink {count} resources? Unlinking will only remove objects from the database, it will not trigger any cleanup',
        {
          count: permittedResources.length,
        },
      ),
    },
  });

  if (permittedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Unlink')}
      action={mutate}
      className="text-danger"
      staff
      iconNode={<LinkBreakIcon weight="bold" />}
      iconColor="danger"
      disabled={isPending || permittedResources.length !== rows.length}
    />
  );
};
