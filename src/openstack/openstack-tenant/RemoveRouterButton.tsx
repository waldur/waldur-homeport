import { OpenStackRouter, openstackRoutersDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const RemoveRouterButton: ActionItemType<OpenStackRouter> = ({
  resource,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openstackRoutersDestroy({ path: { uuid: resource.uuid } }),
    successMessage: translate('Router was removed.'),
    errorMessage: translate('Unable to remove router.'),
    refetch,
    confirmation: {
      title: translate('Removing router'),
      body: translate('Are you sure you want to remove this router?'),
      options: { forDeletion: true, positiveButton: translate('Remove') },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Remove router')}
      action={mutate}
      disabled={isPending}
    />
  );
};
