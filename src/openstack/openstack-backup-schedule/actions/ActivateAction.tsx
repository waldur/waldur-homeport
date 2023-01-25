import { translate } from '@waldur/i18n';
import { activateBackupSchedule } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [
  ({ resource }) => {
    if (resource.is_active) {
      return translate('Resource schedule is already activated.');
    }
  },
];

export const ActivateAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Activate')}
    apiMethod={activateBackupSchedule}
    resource={resource}
    validators={validators}
    refetch={refetch}
  />
);
