import { translate } from '@waldur/i18n';
import { activateSnapshotSchedule } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';

const validators = [
  ({ resource }) => {
    if (resource.is_active) {
      return translate('Resource schedule is already activated.');
    }
  },
];

export const ActivateSnapshotScheduleAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Activate')}
    apiMethod={activateSnapshotSchedule}
    resource={resource}
    validators={validators}
  />
);
