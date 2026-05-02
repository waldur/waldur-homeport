import { openstackMigrationsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteMigrationAction = ({ resource, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openstackMigrationsDestroy({ path: { uuid: resource.uuid } }),
    successMessage: translate('Replication has been deleted.'),
    errorMessage: translate('Unable to delete replication.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete the replication?'),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
      size="sm"
    />
  );
};
