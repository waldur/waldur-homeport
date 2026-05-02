import { XIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const MultiDestroyAction = ({ rows, refetch }) => {
  const user = useUser();

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          ['OK', 'ERRED'].includes(resource.state) &&
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.TERMINATE,
          ) &&
          hasPermission(user, {
            permission: PermissionEnum.TERMINATE_RESOURCE,
            projectId: resource.project_uuid,
            customerId: resource.customer_uuid,
          }),
      ),
    [rows, user],
  );

  const { mutate, isPending } = useBatchMutation<any, void>({
    rows: permittedResources,
    refetch,
    mutationFn: (resource) =>
      marketplaceResourcesTerminate({ path: { uuid: resource.uuid } }),
    successMessage: translate('Resources have been destroyed.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} resources have been destroyed.', { n }),
    errorMessage: translate('Unable to destroy resources.'),
    renderErrorMessage: (n) =>
      translate('{n} resources could not be destroyed.', { n }),
    confirmation: {
      title: translate('Destroy resources'),
      body: translate('Are you sure you want to destroy {count} resources?', {
        count: permittedResources.length,
      }),
      options: { forDeletion: true },
    },
  });

  if (permittedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Destroy')}
      action={mutate}
      disabled={permittedResources.length !== rows.length || isPending}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
