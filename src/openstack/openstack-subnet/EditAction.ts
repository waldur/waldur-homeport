import { translate } from '@waldur/i18n';
import { updateSubnet } from '@waldur/openstack/api';
import { createEditAction, validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { getFields } from './fields';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: getFields(),
    validators: [validateState('OK')],
    updateResource: updateSubnet,
    verboseName: translate('OpenStack subnet'),
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
      gateway_ip: resource.gateway_ip,
      disable_gateway: resource.disable_gateway,
      enable_default_gateway: resource.enable_default_gateway,
      host_routes: resource.host_routes,
      dns_nameservers: resource.dns_nameservers,
    }),
  });
}
