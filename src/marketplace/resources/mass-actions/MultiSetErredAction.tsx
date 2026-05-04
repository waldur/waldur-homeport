import { CloudXIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import {
  marketplaceProviderResourcesSetAsErred,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const MultiSetErredAction = ({ rows, refetch }) => {
  const user = useUser();

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.SET_AS_ERRED,
          ) &&
          hasPermission(user, {
            permission: PermissionEnum.SET_RESOURCE_STATE,
            customerId: resource.provider_uuid,
          }),
      ),
    [rows, user],
  );

  const { mutate, isPending } = useBatchMutation<Resource, void>({
    rows: permittedResources,
    refetch,
    mutationFn: (resource) =>
      marketplaceProviderResourcesSetAsErred({
        path: { uuid: resource.uuid },
      }),
    successMessage: translate('Resources have been set to erred.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} resources have been set to erred.', { n }),
    errorMessage: translate('Unable to set resources to erred.'),
    renderErrorMessage: (n) =>
      translate('Unable to set {n} resources to erred.', { n }),
    confirmation: {
      title: translate('Perform mass action'),
      body: translate(
        'Are you sure you want to set {count} resources to erred?',
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
      title={translate('Set erred')}
      action={mutate}
      className="text-danger"
      iconNode={<CloudXIcon weight="bold" />}
      iconColor="danger"
      staff
      disabled={permittedResources.length !== rows.length || isPending}
    />
  );
};
