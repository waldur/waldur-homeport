import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceResourcesRestore, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

interface RestoreResourceActionProps {
  resource: Resource;
  refetch?(): void;
}

export const RestoreResourceAction: FC<RestoreResourceActionProps> = ({
  resource,
  refetch,
}) => {
  const user = useUser();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourcesRestore({
        path: { uuid: resource.uuid },
        // The restore action re-provisions the existing resource and ignores
        // the request body, but the generated client still requires one.
        body: {} as any,
      }),
    confirmation: {
      title: translate('Restore resource'),
      body: translate(
        'Are you sure you want to restore {name}? The resource will be re-provisioned and moved back to an active state.',
        { name: resource.name },
      ),
    },
    successMessage: translate('Resource restoration has been requested.'),
    errorMessage: translate('Unable to restore the resource.'),
    refetch,
    invalidateQueries: [{ queryKey: ['marketplace-resources'] }],
  });

  const canRestore =
    (resource.offering_plugin_options as any)?.can_restore_resource === true;

  if (
    resource.state !== 'Terminated' ||
    !canRestore ||
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_STATE,
      customerId: resource.provider_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Restore resource')}
      action={mutate}
      disabled={isPending}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
    />
  );
};
