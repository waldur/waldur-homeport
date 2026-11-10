import { XIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { marketplaceResourcesTerminate, Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useModal } from '@/modal/actions';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const MultiTerminateDialog = lazyComponent(() =>
  import('./MultiTerminateDialog').then((module) => ({
    default: module.MultiTerminateDialog,
  })),
);

export const MultiTerminateAction = ({ rows, refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          // Marketplace resource states, not the scope's (which spells it ERRED).
          ['OK', 'Erred'].includes(resource.state) &&
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

  // Instances need the volume and floating IP options, which the plain
  // confirmation cannot ask for.
  const hasInstances = permittedResources.some(
    (resource) => resource.resource_type === INSTANCE_TYPE,
  );

  const openTerminateDialog = () =>
    openDialog(MultiTerminateDialog, {
      resolve: { rows: permittedResources, refetch },
    });

  if (permittedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Terminate')}
      action={hasInstances ? openTerminateDialog : mutate}
      disabled={permittedResources.length !== rows.length || isPending}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
