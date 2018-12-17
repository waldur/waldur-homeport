import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';
import { formatFlavor } from '@waldur/resource/utils';

import { OpenStackBackup } from '../types';

export default function createAction(ctx: ActionContext<OpenStackBackup>): ResourceAction<OpenStackBackup> {
  return {
    name: 'restore',
    type: 'form',
    method: 'POST',
    title: translate('Restore'),
    validators: [validateState('OK')],
    fields: [
      {
        name: 'flavor',
        type: 'select',
        required: true,
        label: translate('Flavor'),
        url: `${ENV.apiEndpoint}api/openstacktenant-flavors/?settings_uuid=${ctx.resource.service_settings_uuid}`,
        value_field: 'url',
        display_name_field: 'name',
        valueFormatter: x => x,
        serializer: (value: {url: string, name: string}) => value.url,
        formatter: (_, resource) => formatFlavor(resource),
      },
      {
        name: 'security_groups',
        type: 'multiselect',
        label: translate('Security groups'),
        placeholder: translate('Select security groups...'),
        url: `${ENV.apiEndpoint}api/openstacktenant-security-groups/?settings_uuid=${ctx.resource.service_settings_uuid}`,
        init: (_, resource, form) => {
          form.security_groups = resource.instance_security_groups;
        },
        serializer: items => items.map(item => ({url: item.value})),
        value_field: 'url',
        display_name_field: 'name',
      },
      {
        name: 'networks',
        label: translate('Networks'),
        component: 'openstackInstanceNetworks',
        init: (field, resource, form, action) => {
          field.choices = {
            subnets: action.fields.internal_ips_set.rawChoices,
            floating_ips: action.fields.floating_ips.rawChoices,
          };
          form.internal_ips_set = resource.instance_internal_ips_set;
        },
      },
      {
        name: 'summary',
        component: 'openstackBackupRestoreSummary',
        formGroupClass: 'm-b-n',
      },
    ],
  };
}
