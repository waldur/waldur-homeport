import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

import { userCanModifyTenant } from './utils';

// All tenant resources will be deleted.
export default function createAction(): ResourceAction {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [userCanModifyTenant],
  };
}
