import { translate } from '@waldur/i18n';
import { executeConsoleLogAction } from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'console_log',
    title: translate('Show console log'),
    type: 'callback',
    execute: (resource) =>
      executeConsoleLogAction(resource, 'openstacktenant-instances'),
    validators: [validateState('OK')],
  };
}
