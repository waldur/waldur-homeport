import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { internalIpFormatter } from '../openstack-instance-config';

function createSubnetField() {
  return {
    name: 'internal_ips_set',
    type: 'multiselect',
    label: translate('Connected subnets'),
    placeholder: translate('Select subnets to connect to...'),
    resource_default_value: true,
    serializer: items => items.map(item => ({ subnet: item.value })),
    formatter: item => internalIpFormatter(item),
    modelParser: items => items.map(item => ({
      url: item.subnet,
      name: item.subnet_name,
      cidr: item.subnet_cidr,
    })),
    value_field: 'url',
  };
}

export default function createAction(): ResourceAction {
  return {
    name: 'update_internal_ips_set',
    type: 'form',
    method: 'POST',
    tab: 'internal_ips',
    title: translate('Configure'),
    iconClass: 'fa fa-wrench',
    validators: [validateState('OK')],
    fields: [createSubnetField()],
  };
}
