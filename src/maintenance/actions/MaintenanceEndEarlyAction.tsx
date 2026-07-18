import { CheckSquareIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsCompleteMaintenance,
  maintenanceAnnouncementsPartialUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { appendInternalNote } from './internalNotes';

interface MaintenanceEndEarlyActionProps {
  row: MaintenanceAnnouncement;
  refetch: () => void;
}

export const MaintenanceEndEarlyAction: FC<MaintenanceEndEarlyActionProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, any>({
    mutationFn: async (result) => {
      const reason = result?.input as string;
      const updatedNotes = appendInternalNote(
        row.internal_notes,
        translate('End early'),
        reason,
      );
      await maintenanceAnnouncementsPartialUpdate({
        path: { uuid: row.uuid },
        body: { internal_notes: updatedNotes },
      });
      return maintenanceAnnouncementsCompleteMaintenance({
        path: { uuid: row.uuid },
      });
    },
    confirmation: {
      title: translate('End maintenance early'),
      body: translate(
        'The maintenance will be marked completed immediately. Please provide a reason that will be recorded in internal notes.',
      ),
      options: {
        showInput: true,
        inputRequired: true,
        inputLabel: translate('Reason for ending early'),
        positiveButton: translate('End maintenance'),
        negativeButton: translate('Back'),
        iconNode: <CheckSquareIcon weight="bold" />,
        type: 'success',
      },
    },
    successMessage: translate('Maintenance completed'),
    successDescription: translate(
      'The maintenance window {name} has been finalized and all related activities are closed.',
      { name: row.name },
    ),
    errorMessage: translate('Unable to end maintenance early.'),
    refetch,
  });

  if (row.state !== 'In progress') return null;

  return (
    <ActionItem
      title={translate('End early')}
      action={mutate}
      iconNode={<CheckSquareIcon weight="bold" />}
      iconColor="success"
      disabled={isPending}
    />
  );
};
