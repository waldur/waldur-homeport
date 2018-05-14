import { translate } from '@waldur/i18n';

import { ResourceAction } from '@waldur/resource/actions/types';

import { userCanModifyTenant } from './utils';

export default function createAction(): ResourceAction {
  return {
    name: 'request_custom_flavour',
    type: 'form',
    method: 'POST',
    title: translate('Request custom flavour'),
    component: 'openstackTenantRequestCustomFlavour',
    useResolve: true,
    validators: [userCanModifyTenant],
  };
}
