import activateAction from '@waldur/openstack/openstack-backup-schedule/actions/ActivateAction';
import deactivateAction from '@waldur/openstack/openstack-backup-schedule/actions/DeactivateAction';
import destroyAction from '@waldur/openstack/openstack-backup-schedule/actions/DestroyAction';

import editAction from './EditAction';

export default [editAction, activateAction, deactivateAction, destroyAction];
