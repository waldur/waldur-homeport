import { XIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { marketplaceResourcesTerminate, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const MultiTerminateAction = ({ rows, refetch }) => {
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

  const { mutate, isPending } = useBatchMutation<Resource, void>({
    rows: permittedResources,
    refetch,
    mutationFn: (resource) =>
      marketplaceResourcesTerminate({ path: { uuid: resource.uuid } }),
    successMessage: translate('Resources have been terminated.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} resources have been terminated.', { n }),
    errorMessage: translate('Unable to terminate resources.'),
    renderErrorMessage: (n) =>
      translate('{n} resources could not be terminated.', { n }),
    confirmation: {
      title: translate('Terminate resources'),
      body: translate('Are you sure you want to terminate {count} resources?', {
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
      title={translate('Terminate')}
      action={mutate}
      disabled={permittedResources.length !== rows.length || isPending}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
