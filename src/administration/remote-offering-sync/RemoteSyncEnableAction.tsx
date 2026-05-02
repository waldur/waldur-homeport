import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { marketplaceRemoteSynchronisationsPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { RemoteSyncActionProps } from './types';

export const RemoteSyncEnableAction = (props: RemoteSyncActionProps) => {
  const { mutate, isPending: isLoading } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceRemoteSynchronisationsPartialUpdate({
        path: { uuid: props.row.uuid },
        body: {
          is_active: !props.row.is_active,
        },
      }),
    successMessage: props.row.is_active
      ? translate('Remote synchronization disabled')
      : translate('Remote synchronization enabled'),
    errorMessage: props.row.is_active
      ? translate('Unable to disable remote synchronization')
      : translate('Unable to enable remote synchronization'),
    refetch: props.refetch,
  });

  return (
    <ActionItem
      title={props.row.is_active ? translate('Disable') : translate('Enable')}
      action={mutate}
      iconNode={
        props.row.is_active ? (
          <XCircleIcon weight="bold" />
        ) : (
          <CheckCircleIcon weight="bold" />
        )
      }
      disabled={isLoading}
    />
  );
};
