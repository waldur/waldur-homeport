import { translate } from '@waldur/i18n';
import {
  loadFlavors,
  loadSecurityGroups,
  loadFloatingIps,
  loadSubnets,
} from '@waldur/openstack/api';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { formatFlavor } from '@waldur/resource/utils';

import { OpenStackBackup } from '../types';

export default function createAction(): ResourceAction<OpenStackBackup> {
  return {
    name: 'restore',
    type: 'form',
    method: 'POST',
    title: translate('Restore'),
    validators: [validateState('OK')],
    init: async (resource, form, action) => {
      const [
        flavors,
        securityGroups,
        floatingIps,
        internalIps,
      ] = await Promise.all([
        loadFlavors(resource.service_settings_uuid),
        loadSecurityGroups(resource.service_settings_uuid),
        loadFloatingIps(resource.service_settings_uuid),
        loadSubnets(resource.service_settings_uuid),
      ]);

      form.security_groups = resource.instance_security_groups.map(choice => ({
        value: choice.url,
        display_name: choice.name,
      }));

      action.fields.security_groups.choices = securityGroups.map(choice => ({
        value: choice.url,
        display_name: choice.name,
      }));

      action.fields.flavor.choices = flavors.map(flavor => ({
        display_name: formatFlavor(flavor),
        value: flavor,
      }));

      action.fields.networks.choices = {
        subnets: internalIps,
        floating_ips: floatingIps,
      };

      form.internal_ips_set = resource.instance_internal_ips_set;
    },
    serializer: form => {
      return {
        flavor: form.flavor.url,
        internal_ips_set: form.internal_ips_set,
        floating_ips: form.floating_ips,
        security_groups: form.security_groups.map(item => ({
          url: item.value,
        })),
      };
    },
    fields: [
      {
        name: 'flavor',
        type: 'select',
        required: true,
        label: translate('Flavor'),
      },
      {
        name: 'security_groups',
        type: 'multiselect',
        label: translate('Security groups'),
        placeholder: translate('Select security groups...'),
      },
      {
        name: 'networks',
        label: translate('Networks'),
        component: 'openstackInstanceNetworks',
      },
      {
        name: 'summary',
        component: 'openstackBackupRestoreSummary',
        formGroupClass: 'm-b-n',
      },
    ],
  };
}
