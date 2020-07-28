import { translate } from '@waldur/i18n';
import {
  executeConsoleAction,
  validatePermissionsForConsoleAction,
} from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export function consoleAction(): ResourceAction {
  return {
    name: 'console',
    title: translate('Open console'),
    type: 'callback',
    execute: (resource) => executeConsoleAction(resource, 'rancher-nodes'),
    validators: [validateState('OK'), validatePermissionsForConsoleAction],
  };
}
