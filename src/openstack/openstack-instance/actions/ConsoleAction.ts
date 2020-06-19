import { translate } from '@waldur/i18n';
import {
  executeConsoleAction,
  validatePermissionsForConsoleAction,
} from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'console',
    title: translate('Open console'),
    type: 'callback',
    execute: (resource) =>
      executeConsoleAction(resource, 'openstacktenant-instances'),
    validators: [validateState('OK'), validatePermissionsForConsoleAction],
  };
}
