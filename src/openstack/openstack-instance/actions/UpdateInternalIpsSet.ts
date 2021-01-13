import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { formatSubnet } from '../utils';

function createSubnetField(ctx) {
  return {
    name: 'internal_ips_set',
    type: 'multiselect',
    label: translate('Connected subnets'),
    placeholder: translate('Select subnets to connect to...'),
    resource_default_value: true,
    serializer: (items) => items.map((item) => ({ subnet: item.value })),
    formatter: (item) => formatSubnet(item),
    modelParser: (_, items) =>
      items.map((item) => ({
        url: item.subnet,
        name: item.subnet_name,
        cidr: item.subnet_cidr,
      })),
    value_field: 'url',
    url: `${ENV.apiEndpoint}api/openstacktenant-subnets/?settings_uuid=${ctx.resource.service_settings_uuid}`,
  };
}

export default function createAction(ctx): ResourceAction {
  return {
    name: 'update_internal_ips_set',
    type: 'form',
    method: 'POST',
    tab: 'internal_ips',
    title: translate('Configure'),
    iconClass: 'fa fa-wrench',
    validators: [validateState('OK')],
    fields: [createSubnetField(ctx)],
  };
}
