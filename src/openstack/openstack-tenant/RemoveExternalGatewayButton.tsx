import {
  OpenStackRouter,
  openstackRoutersRemoveExternalGateway,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const RemoveExternalGatewayButton: ActionItemType<OpenStackRouter> = ({
  resource,
  refetch,
}) => {
  const { confirm } = useModal();

  const { mutate, isPending = false } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openstackRoutersRemoveExternalGateway({
        path: { uuid: resource.uuid },
      }),
    successMessage: translate('External gateway removal was scheduled.'),
    errorMessage: translate('Unable to remove the external gateway.'),
    invalidateQueries: [{ queryKey: ['openstack-routers'] }],
  });

  if (!resource.has_external_gateway) {
    return null;
  }

  const removeGateway = async () => {
    try {
      await confirm(
        translate('Remove external gateway'),
        translate(
          'Are you sure you want to remove the external gateway from this router? Floating IPs associated with the gateway network must be released first.',
        ),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    mutate(undefined, { onSuccess: () => refetch?.() });
  };

  return (
    <RemovalActionItem
      title={translate('Remove external gateway')}
      action={removeGateway}
      disabled={isPending}
    />
  );
};
