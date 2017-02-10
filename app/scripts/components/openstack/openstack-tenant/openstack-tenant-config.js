import {
  openstackTemplateColumns,
  templateParser,
  templateFormatter,
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
      label: 'Tenant name'
    },
    template: {
      type: 'list',
      required: true,
      label: 'VPC package',
      dialogTitle: 'Select Virtual Private Cloud package',
      dialogSize: 'lg',
      resource: 'package-templates',
      parser: templateParser,
      formatter: templateFormatter,
      columns: openstackTemplateColumns,
      comparator: templateComparator,
      filterOptions: openstackTemplateFilters
    },
    description: {
      type: 'text',
      label: 'Description'
    },
    access: {
      type: 'label',
      label: 'Access'
    },
    user_username: {
      type: 'string',
      label: 'Initial admin username',
      placeholder: 'generate automatically',
      help_text: 'Leave blank if you want admin username to be auto-generated'
    },
    user_password: {
      type: 'password',
      label: 'Initial admin password',
      placeholder: 'generate automatically',
      help_text: 'Leave blank if you want admin password to be auto-generated'
    },
    subnet_cidr: {
      component: 'openstackSubnet',
      label: 'Internal network mask (CIDR)',
      default_value: 42,
      mask: '192.168.X.0/24',
      serializer: (value, field) => field.mask.replace('X', value)
    },
    subnet_allocation_pool: {
      component: 'openstackAllocationPool',
      label: 'Internal network allocation pool',
      range: '192.168.X.10 — 192.168.X.200',
      parentField: 'subnet_cidr'
    },
  },
  summaryComponent: 'openstackTenantCheckoutSummary'
};
