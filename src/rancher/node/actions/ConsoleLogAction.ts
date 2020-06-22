import { translate } from '@waldur/i18n';
import { executeConsoleLogAction } from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export function consoleLogAction(): ResourceAction {
  return {
    name: 'console_log',
    title: translate('Show console log'),
    type: 'callback',
    execute: (resource) => executeConsoleLogAction(resource, 'rancher-nodes'),
    validators: [validateState('OK')],
  };
}
