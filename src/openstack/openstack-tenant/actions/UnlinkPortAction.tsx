import { openstackPortsUnlink } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const UnlinkPortAction: ActionItemType = ({ resource, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => openstackPortsUnlink({ path: { uuid: resource.uuid } }),
    successMessage: translate('Port has been unlinked.'),
    errorMessage: translate('Unable to unlink port.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to unlink the port? Unlinking will only remove object from the database, it will not trigger any cleanup',
      ),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Unlink')}
      action={mutate}
      disabled={isPending}
      staff
    />
  );
};
