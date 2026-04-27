import {
  CheckCircleIcon,
  ClockCountdownIcon,
  ClockCounterClockwiseIcon,
  PlayCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsCancelMaintenance,
  maintenanceAnnouncementsCompleteMaintenance,
  maintenanceAnnouncementsSchedule,
  maintenanceAnnouncementsStartMaintenance,
  maintenanceAnnouncementsUnschedule,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface MaintenanceStateActionProps {
  row: MaintenanceAnnouncement;
  refetch: () => void;
}

const getMaintenanceStateActions = (row: MaintenanceAnnouncement) => {
  const cancelAction = {
    key: 'cancel',
    label: translate('Cancel'),
    icon: XCircleIcon,
  };
  switch (row.state) {
    case 'Draft':
      return [
        {
          key: 'schedule',
          label: translate('Schedule'),
          icon: ClockCountdownIcon,
        },
        cancelAction,
      ];
    case 'Scheduled':
      return [
        { key: 'start', label: translate('Start'), icon: PlayCircleIcon },
        {
          key: 'unschedule',
          label: translate('Unschedule'),
          icon: ClockCounterClockwiseIcon,
        },
        cancelAction,
      ];
    case 'In progress':
      return [
        {
          key: 'complete',
          label: translate('Set as completed'),
          icon: CheckCircleIcon,
        },
        cancelAction,
      ];
    default:
      return null;
  }
};

export const MaintenanceStateActions = ({
  row,
  refetch,
}: MaintenanceStateActionProps) => {
  const dispatch = useDispatch();
  const actions = getMaintenanceStateActions(row);

  const updateState = useCallback(
    async (action: ReturnType<typeof getMaintenanceStateActions>[number]) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate(
            'Are you sure you want to {action} the maintenance announcement?',
            { action: String(action.label).toLocaleLowerCase() },
          ),
          {
            positiveButton: action.label,
            negativeButton: translate('Cancel'),
            iconNode: <action.icon weight="bold" />,
          },
        );
      } catch {
        return;
      }

      try {
        let api;
        switch (action.key) {
          case 'start':
            api = maintenanceAnnouncementsStartMaintenance;
            break;
          case 'schedule':
            api = maintenanceAnnouncementsSchedule;
            break;
          case 'unschedule':
            api = maintenanceAnnouncementsUnschedule;
            break;
          case 'complete':
            api = maintenanceAnnouncementsCompleteMaintenance;
            break;
          case 'cancel':
            api = maintenanceAnnouncementsCancelMaintenance;
            break;
        }
        if (!api) return;
        await api({ path: { uuid: row.uuid } });
        dispatch(showSuccess(translate('Maintenance announcement updated')));
        await refetch();
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to update maintenance announcement state.'),
          ),
        );
      }
    },
    [row, dispatch, refetch],
  );

  if (!actions) return null;

  return actions.map((action) => (
    <ActionItem
      key={action.key}
      title={action.label}
      action={() => updateState(action)}
      iconNode={<action.icon weight="bold" />}
    />
  ));
};
