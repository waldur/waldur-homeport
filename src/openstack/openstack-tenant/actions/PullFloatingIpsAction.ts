import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'pull_floating_ips',
    type: 'button',
    method: 'POST',
    tab: 'floating_ips',
    title: translate('Synchronise'),
    validators: [validateState('OK')],
  };
}
