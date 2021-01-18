import { destroyBackup } from '@waldur/openstack/api';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

const validators = [validateState('OK', 'Erred')];

export const DestroyBackupAction = ({ resource }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroyBackup}
  />
);
