import { ProhibitInsetIcon } from '@phosphor-icons/react';
import { maintenanceAnnouncementsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const MaintenanceStopAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      maintenanceAnnouncementsDestroy({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Maintenance record has been stopped.'),
    errorMessage: translate('Unable to stop maintenance record.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to stop the maintenance record?'),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Stop')}
      action={mutate}
      iconNode={<ProhibitInsetIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      disabled={isPending}
    />
  );
};
