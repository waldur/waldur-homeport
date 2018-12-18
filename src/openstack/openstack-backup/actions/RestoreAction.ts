import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { formatFlavor } from '@waldur/resource/utils';

import { OpenStackBackup } from '../types';

interface NamedResource {
  url: string;
  name: string;
}

interface Choice {
  value: string;
  display_name: string;
}

const formatChoices = (choices: NamedResource[]): Choice[] => choices.map(choice => ({
  value: choice.url,
  display_name: choice.name,
}));

// tslint:disable-next-line:variable-name
const loadFlavors = (settings_uuid: string) =>
  getAll<NamedResource>('/openstacktenant-flavors/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
const loadSecurityGroups = (settings_uuid: string) =>
  getAll<NamedResource>('/openstacktenant-security-groups/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
const loadSubnets = (settings_uuid: string) =>
  getAll<NamedResource>('/openstacktenant-subnets/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
const loadFloatingIps = (settings_uuid: string) =>
  getAll<NamedResource>('/openstacktenant-security-groups/', {params: {
    is_booked: 'False',
    free: 'True',
    settings_uuid,
  }});

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

      const securityGroupChoices = formatChoices(securityGroups);
      const securityGroupsUrls = resource.instance_security_groups.map(sg => sg.url);
      const preselectsecurityGroups = securityGroupChoices.filter(sg => securityGroupsUrls.includes(sg.value));

      action.fields.security_groups.choices = securityGroupChoices;
      form.security_groups = preselectsecurityGroups;

      action.fields.flavor.choices = flavors.map(flavor => ({
        display_name: formatFlavor(flavor),
        value: flavor.url,
      }));
      action.fields.networks.choices = {
        subnets: internalIps,
        floating_ips: floatingIps,
      };
    },
    serializer: form => {
      return {
        flavor: form.flavor,
        security_groups: form.security_groups.map(item => ({url: item.value})),
        networks: form.networks,
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
