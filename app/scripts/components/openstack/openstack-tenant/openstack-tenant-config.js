import { latinName } from '@waldur/resource/actions/constants';
import { getTemplateFilterOptions } from './actions/utils';

import { templateParser } from '../utils';
import {
  openstackTemplateColumns,
  templateComparator,
  openstackTemplateFilters
} from './openstack-template';

export default {
  order: [
    'name',
    'template',
    'description',
    'access',
    'user_username',
    'user_password',
    'subnet_cidr',
    'subnet_allocation_pool',
    'skip_connection_extnet',
  ],
  options: {
    name: {
      ...latinName,
      label: gettext('Tenant name'),
      form_text: gettext('This name will be visible in accounting data.'),
    },
    template: {
      type: 'list',
      required: true,
      label: gettext('VPC package'),
      dialogTitle: gettext('Select Virtual Private Cloud package'),
      dialogSize: 'lg',
      resource: context => ({
        endpoint: 'package-templates',
        params: {
          archived: 'False',
          service_settings_uuid: context.settings_uuid,
        }
      }),
      parser: templateParser,
      formatter: ($filter, value) => $filter('formatPackage')(value),
      columns: openstackTemplateColumns,
      comparator: templateComparator,
      filterOptions: openstackTemplateFilters,
      concealEmptyOptions: getTemplateFilterOptions,
    },
    description: {
      type: 'text',
      label: gettext('Description')
    },
    access: {
      type: 'label',
      label: gettext('Access'),
      is_visible: ENV => ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
    },
    user_username: {
      type: 'string',
      label: gettext('Initial admin username'),
      placeholder: gettext('generate automatically'),
      help_text: gettext('Leave blank if you want admin username to be auto-generated.'),
      is_visible: ENV => ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
    },
    user_password: {
      type: 'password',
      autocomplete: false,
      label: gettext('Initial admin password'),
      placeholder: gettext('generate automatically'),
      help_text: gettext('Leave blank if you want admin password to be auto-generated.'),
      is_visible: ENV => ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
    },
    subnet_cidr: {
      component: 'openstackSubnet',
      label: gettext('Internal network mask (CIDR)'),
      default_value: 42,
      mask: '192.168.X.0/24',
      serializer: (value, field) => field.mask.replace('X', value)
    },
    subnet_allocation_pool: {
      component: 'openstackAllocationPool',
      label: gettext('Internal network allocation pool'),
      range: '192.168.X.10 — 192.168.X.200',
      parentField: 'subnet_cidr'
    },
    skip_connection_extnet: {
      type: 'boolean',
      label: gettext('Skip connection to external network'),
      default_value: false,
      is_visible: ENV => ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES,
    },
  },
  summaryComponent: 'openstackTenantCheckoutSummary'
};
