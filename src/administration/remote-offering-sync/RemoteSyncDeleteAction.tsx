import { marketplaceRemoteSynchronisationsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { RemoteSyncActionProps } from './types';

export const RemoteSyncDeleteAction = (props: RemoteSyncActionProps) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceRemoteSynchronisationsDestroy({
        path: { uuid: props.row.uuid },
      }),
    successMessage: translate('Remote synchronization deleted'),
    errorMessage: translate('Unable to delete remote synchronization.'),
    refetch: props.refetch,
    confirmation: {
      title: translate('Delete remote synchronization'),
      body: translate(
        'You are about to delete {connection} synchronisation. This action cannot be undone.',
        { connection: <strong>{props.row.api_url}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
