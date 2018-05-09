import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'pull_security_groups',
    type: 'button',
    method: 'POST',
    tab: 'security_groups',
    title: translate('Synchronise'),
    validators: [validateState('OK')],
  };
}
