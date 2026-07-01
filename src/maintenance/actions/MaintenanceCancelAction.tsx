import { XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsCancelMaintenance,
  maintenanceAnnouncementsPartialUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { appendInternalNote } from './internalNotes';

interface MaintenanceCancelActionProps {
  row: MaintenanceAnnouncement;
  refetch: () => void;
}

export const MaintenanceCancelAction: FC<MaintenanceCancelActionProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, any>({
    mutationFn: async (result) => {
      const reason = result?.input as string;
      const updatedNotes = appendInternalNote(
        row.internal_notes,
        translate('Cancel'),
        reason,
      );
      await maintenanceAnnouncementsPartialUpdate({
        path: { uuid: row.uuid },
        body: { internal_notes: updatedNotes },
      });
      return maintenanceAnnouncementsCancelMaintenance({
        path: { uuid: row.uuid },
      });
    },
    confirmation: {
      title: translate('Cancel maintenance'),
      body: translate(
        'Cancelling will halt the maintenance and notify affected consumers. Please provide a reason that will be recorded in internal notes.',
      ),
      options: {
        showInput: true,
        inputRequired: true,
        inputLabel: translate('Reason for cancellation'),
        positiveButton: translate('Cancel maintenance'),
        negativeButton: translate('Back'),
        iconNode: <XCircleIcon weight="bold" />,
        type: 'danger',
      },
    },
    successMessage: translate('Maintenance announcement has been cancelled.'),
    errorMessage: translate('Unable to cancel maintenance announcement.'),
    refetch,
  });

  return (
    <ActionItem
      title={translate('Cancel')}
      action={mutate}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={isPending}
    />
  );
};
