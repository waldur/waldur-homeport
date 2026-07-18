import {
  ClockCountdownIcon,
  ClockCounterClockwiseIcon,
  PlayCircleIcon,
} from '@phosphor-icons/react';
import { Icon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsSchedule,
  maintenanceAnnouncementsStartMaintenance,
  maintenanceAnnouncementsUnschedule,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { MaintenanceCancelAction } from './MaintenanceCancelAction';
import { MaintenanceEndEarlyAction } from './MaintenanceEndEarlyAction';
import { MaintenanceExtendAction } from './MaintenanceExtendAction';

interface MaintenanceStateActionProps {
  row: MaintenanceAnnouncement;
  refetch: () => void;
}

interface MaintenanceAction {
  key: string;
  label: string;
  icon: Icon;
  api: (params: { path: { uuid: string } }) => Promise<any>;
  successMessage: string;
  successDescription: string;
}

const getTransitionActions = (
  row: MaintenanceAnnouncement,
): MaintenanceAction[] => {
  switch (row.state) {
    case 'Draft':
      return [
        {
          key: 'schedule',
          label: translate('Schedule'),
          icon: ClockCountdownIcon,
          api: maintenanceAnnouncementsSchedule,
          successMessage: translate('Maintenance scheduled'),
          successDescription: translate(
            'The maintenance window {name} has been scheduled.',
            { name: row.name },
          ),
        },
      ];
    case 'Scheduled':
      return [
        {
          key: 'start',
          label: translate('Start'),
          icon: PlayCircleIcon,
          api: maintenanceAnnouncementsStartMaintenance,
          successMessage: translate('Maintenance started'),
          successDescription: translate(
            'The maintenance window {name} is now in progress.',
            { name: row.name },
          ),
        },
        {
          key: 'unschedule',
          label: translate('Move back to draft'),
          icon: ClockCounterClockwiseIcon,
          api: maintenanceAnnouncementsUnschedule,
          successMessage: translate('Maintenance moved to draft'),
          successDescription: translate(
            'The maintenance window {name} has been moved back to draft.',
            { name: row.name },
          ),
        },
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
    successMessage: action.successMessage,
    successDescription: action.successDescription,
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
  const transitions = getTransitionActions(row);
  const isInProgress = row.state === 'In progress';
  const showCancel = row.state === 'Scheduled' || row.state === 'In progress';

  if (transitions.length === 0 && !isInProgress && !showCancel) {
    return null;
  }

  return (
    <>
      {transitions.map((action) => (
        <MaintenanceActionItem
          key={action.key}
          action={action}
          row={row}
          refetch={refetch}
        />
      ))}
      {isInProgress && (
        <>
          <MaintenanceExtendAction row={row} refetch={refetch} />
          <MaintenanceEndEarlyAction row={row} refetch={refetch} />
        </>
      )}
      {showCancel && <MaintenanceCancelAction row={row} refetch={refetch} />}
    </>
  );
};
