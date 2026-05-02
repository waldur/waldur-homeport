import { GearSixIcon } from '@phosphor-icons/react';
import { marketplaceRemoteSynchronisationsRunSynchronisation } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { RemoteSyncActionProps } from './types';

export const RemoteSyncSynchroniseAction = (props: RemoteSyncActionProps) => {
  const { mutate, isPending: isLoading } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceRemoteSynchronisationsRunSynchronisation({
        path: { uuid: props.row.uuid },
      }),
    successMessage: translate('Synchronisation has been successful.'),
    errorMessage: translate('Unable to synchronise.'),
    refetch: props.refetch,
  });

  return (
    <ActionItem
      title={translate('Synchronise')}
      action={mutate}
      iconNode={<GearSixIcon weight="bold" />}
      disabled={isLoading}
    />
  );
};
