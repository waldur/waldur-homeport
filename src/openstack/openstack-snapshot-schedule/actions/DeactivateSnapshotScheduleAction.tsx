import { translate } from '@waldur/i18n';
import { deactivateSnapshotSchedule } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';

const validators = [
  ({ resource }) => {
    if (!resource.is_active) {
      return translate('Resource schedule is already deactivated.');
    }
  },
];

export const DeactivateSnapshotScheduleAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Deactivate')}
    apiMethod={deactivateSnapshotSchedule}
    resource={resource}
    validators={validators}
  />
);
