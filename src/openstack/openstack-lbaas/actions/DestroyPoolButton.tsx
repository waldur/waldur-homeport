import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OpenStackPool, openstackPoolsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface DestroyPoolButtonProps {
  resource: OpenStackPool;
  refetch?(): void;
}

export const DestroyPoolButton: FC<DestroyPoolButtonProps> = ({
  resource,
  refetch,
}) => {
  const { mutate: destroy, isPending } = useManagedMutation({
    mutationFn: () => openstackPoolsDestroy({ path: { uuid: resource.uuid } }),
    successMessage: translate('Pool was removed.'),
    errorMessage: translate('Unable to remove pool.'),
    refetch,
    confirmation: {
      title: translate('Remove pool'),
      body: translate('Are you sure you want to remove this pool?'),
      options: { forDeletion: true, positiveButton: translate('Remove') },
    },
  });

  return (
    <ActionItem
      title={translate('Remove pool')}
      action={() => destroy()}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={isPending}
    />
  );
};
