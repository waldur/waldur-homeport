import { DefaultPermissionEnum, OptionFieldTypeEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

// Storage folder permission choices - values from SDK DefaultPermissionEnum
export const STORAGE_FOLDER_PERMISSIONS: Array<{
  value: DefaultPermissionEnum;
  label: string;
}> = [
  {
    value: '2770',
    label: translate(
      '2770 - Group write, setgid (recommended for shared projects)',
    ),
  },
  { value: '2775', label: translate('2775 - Group write, world read, setgid') },
  {
    value: '2777',
    label: translate('2777 - Full access, setgid (least secure)'),
  },
  { value: '770', label: translate('770 - Group write, no setgid') },
  {
    value: '775',
    label: translate('775 - Group write, world read, no setgid'),
  },
  { value: '777', label: translate('777 - Full access, no setgid') },
];

export const FIELD_TYPES: Array<{
  value: OptionFieldTypeEnum;
  label: string;
}> = [
  {
    value: 'boolean',
    label: translate('Boolean'),
  },
  {
    value: 'integer',
    label: translate('Integer'),
  },
  {
    value: 'money',
    label: translate('Money'),
  },
  {
    value: 'string',
    label: translate('String'),
  },
  {
    value: 'text',
    label: translate('Text'),
  },
  {
    value: 'html_text',
    label: translate('HTML text'),
  },
  {
    value: 'select_string',
    label: translate('Select'),
  },
  {
    value: 'select_string_multi',
    label: translate('Select multiple options'),
  },
  {
    value: 'select_openstack_tenant',
    label: translate('Select OpenStack tenant'),
  },
  {
    value: 'select_openstack_instance',
    label: translate('Select OpenStack instance'),
  },
  {
    value: 'select_multiple_openstack_instances',
    label: translate('Select multiple OpenStack instances'),
  },
  {
    value: 'date',
    label: translate('Date'),
  },
  {
    value: 'time',
    label: translate('Time'),
  },
  {
    value: 'conditional_cascade',
    label: translate('Conditional Cascade'),
  },
  {
    value: 'component_multiplier',
    label: translate('Component Multiplier'),
  },
  {
    value: 'single_datacenter_k8s_config',
    label: translate('Single-Datacenter Kubernetes Configuration'),
  },
  {
    value: 'multi_datacenter_k8s_config',
    label: translate('Multi-Datacenter Kubernetes Configuration'),
  },
  {
    value: 'storage_folder_manager',
    label: translate('Storage Folder Manager'),
  },
];

export const OPTION_FORM_ID = 'OptionDialog';
