import { GearSixIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { marketplaceRemoteSynchronisationsRunSynchronisation } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { RemoteSyncActionProps } from './types';

export const RemoteSyncSynchroniseAction = (props: RemoteSyncActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await marketplaceRemoteSynchronisationsRunSynchronisation({
          path: { uuid: props.row.uuid },
        });
        dispatch(
          showSuccess(translate('Synchronisation has been successful.')),
        );
        props.refetch();
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to synchronise.')));
      }
    },
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
