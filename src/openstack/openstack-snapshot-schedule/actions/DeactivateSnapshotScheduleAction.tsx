import { translate } from '@waldur/i18n';
import { deactivateSnapshotSchedule } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [
  ({ resource }) => {
    if (!resource.is_active) {
      return translate('Resource schedule is already deactivated.');
    }
  },
];

export const DeactivateSnapshotScheduleAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <AsyncActionItem
    title={translate('Deactivate')}
    apiMethod={deactivateSnapshotSchedule}
    resource={resource}
    validators={validators}
    refetch={refetch}
  />
);
