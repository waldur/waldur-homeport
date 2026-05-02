import { maintenanceAnnouncementsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const MaintenanceDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      maintenanceAnnouncementsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Maintenance record has been deleted.'),
    errorMessage: translate('Unable to delete maintenance record.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the maintenance record?',
      ),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
