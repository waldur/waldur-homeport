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
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('Tenant name')
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
      filterOptions: openstackTemplateFilters
    },
    description: {
      type: 'text',
      label: gettext('Description')
    },
    access: {
      type: 'label',
      label: gettext('Access')
    },
    user_username: {
      type: 'string',
      label: gettext('Initial admin username'),
      placeholder: gettext('generate automatically'),
      help_text: gettext('Leave blank if you want admin username to be auto-generated.')
    },
    user_password: {
      type: 'password',
      autocomplete: false,
      label: gettext('Initial admin password'),
      placeholder: gettext('generate automatically'),
      help_text: gettext('Leave blank if you want admin password to be auto-generated.')
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
  },
  summaryComponent: 'openstackTenantCheckoutSummary'
};
