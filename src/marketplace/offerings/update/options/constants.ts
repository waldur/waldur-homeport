import { OptionFieldTypeEnum } from 'waldur-js-client';

export const FIELD_TYPES: Array<{
  value:
    | OptionFieldTypeEnum
    | 'single_datacenter_k8s_config'
    | 'multi_datacenter_k8s_config';
  label: string;
}> = [
  {
    value: 'boolean',
    label: 'Boolean',
  },
  {
    value: 'integer',
    label: 'Integer',
  },
  {
    value: 'money',
    label: 'Money',
  },
  {
    value: 'string',
    label: 'String',
  },
  {
    value: 'text',
    label: 'Text',
  },
  {
    value: 'html_text',
    label: 'HTML text',
  },
  {
    value: 'select_string',
    label: 'Select',
  },
  {
    value: 'select_string_multi',
    label: 'Select multiple options',
  },
  {
    value: 'select_openstack_tenant',
    label: 'Select OpenStack tenant',
  },
  {
    value: 'select_openstack_instance',
    label: 'Select OpenStack instance',
  },
  {
    value: 'select_multiple_openstack_instances',
    label: 'Select multiple OpenStack instances',
  },
  {
    value: 'date',
    label: 'Date',
  },
  {
    value: 'time',
    label: 'Time',
  },
  {
    value: 'conditional_cascade',
    label: 'Conditional Cascade',
  },
  {
    value: 'component_multiplier',
    label: 'Component Multiplier',
  },
  {
    value: 'single_datacenter_k8s_config',
    label: 'Single-Datacenter Kubernetes Configuration',
  },
  {
    value: 'multi_datacenter_k8s_config',
    label: 'Multi-Datacenter Kubernetes Configuration',
  },
];

export const OPTION_FORM_ID = 'OptionDialog';
