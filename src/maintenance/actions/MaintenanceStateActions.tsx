import {
  CheckCircleIcon,
  ClockCountdownIcon,
  ClockCounterClockwiseIcon,
  PlayCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Icon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsCancelMaintenance,
  maintenanceAnnouncementsCompleteMaintenance,
  maintenanceAnnouncementsSchedule,
  maintenanceAnnouncementsStartMaintenance,
  maintenanceAnnouncementsUnschedule,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface MaintenanceStateActionProps {
  row: MaintenanceAnnouncement;
  refetch: () => void;
}

interface MaintenanceAction {
  key: string;
  label: string;
  icon: Icon;
  api: (params: { path: { uuid: string } }) => Promise<any>;
}

const getMaintenanceStateActions = (
  row: MaintenanceAnnouncement,
): MaintenanceAction[] => {
  const cancelAction: MaintenanceAction = {
    key: 'cancel',
    label: translate('Cancel'),
    icon: XCircleIcon,
    api: maintenanceAnnouncementsCancelMaintenance,
  };
  switch (row.state) {
    case 'Draft':
      return [
        {
          key: 'schedule',
          label: translate('Schedule'),
          icon: ClockCountdownIcon,
          api: maintenanceAnnouncementsSchedule,
        },
        cancelAction,
      ];
    case 'Scheduled':
      return [
        {
          key: 'start',
          label: translate('Start'),
          icon: PlayCircleIcon,
          api: maintenanceAnnouncementsStartMaintenance,
        },
        {
          key: 'unschedule',
          label: translate('Unschedule'),
          icon: ClockCounterClockwiseIcon,
          api: maintenanceAnnouncementsUnschedule,
        },
        cancelAction,
      ];
    case 'In progress':
      return [
        {
          key: 'complete',
          label: translate('Set as completed'),
          icon: CheckCircleIcon,
          api: maintenanceAnnouncementsCompleteMaintenance,
        },
        cancelAction,
      ];
    default:
      return [];
  }
};

const MaintenanceActionItem: FC<{
  action: MaintenanceAction;
  row: MaintenanceAnnouncement;
  refetch: () => void;
}> = ({ action, row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => action.api({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to {action} the maintenance announcement?',
        { action: String(action.label).toLocaleLowerCase() },
      ),
      options: {
        positiveButton: action.label,
        negativeButton: translate('Cancel'),
        iconNode: <action.icon weight="bold" />,
      },
    },
    successMessage: translate('Maintenance announcement updated'),
    errorMessage: translate('Unable to update maintenance announcement state.'),
    refetch,
  });

  return (
    <ActionItem
      title={action.label}
      action={mutate}
      iconNode={<action.icon weight="bold" />}
      disabled={isPending}
    />
  );
};

export const MaintenanceStateActions: FC<MaintenanceStateActionProps> = ({
  row,
  refetch,
}) => {
  const actions = getMaintenanceStateActions(row);

  if (!actions.length) return null;

  return (
    <>
      {actions.map((action) => (
        <MaintenanceActionItem
          key={action.key}
          action={action}
          row={row}
          refetch={refetch}
        />
      ))}
    </>
  );
};
