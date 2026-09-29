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
  /** What the type does, for types whose name does not say it. */
  description?: string;
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
    description: translate(
      'Shows a number calculated from a limit the customer sets (limit × factor), which the customer may override within a range. It is stored as an order attribute and changes no limit or price.',
    ),
  },
  {
    value: 'component_formula',
    label: translate('Component Formula'),
    description: translate(
      'The customer enters one number, and each chosen limit component is set to a formula of it, such as input * 2. The calculated limits are priced like any other and cannot be edited by the customer.',
    ),
  },
  {
    value: 'component_sum',
    label: translate('Component Sum'),
    description: translate(
      'Sets a limit component to the sum of other limit components, whether entered by the customer or calculated by a formula. The customer does not fill it in; the total is shown and priced.',
    ),
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

// A sum has no value of its own to change after ordering.
export const ORDER_ONLY_FIELD_TYPES: OptionFieldTypeEnum[] = ['component_sum'];

/** Description of Component Formula on the resource options tab. */
export const getPairedFormulaDescription = () =>
  translate(
    'Lets customers change the number entered for a Component Formula order option after ordering. The change is ordered with the recalculated limits and price. It uses the formulas and bounds of that order option.',
  );

/** The offering's Component Formula order options, which a resource option can pair with. */
export const getFormulaOrderOptions = (offering) =>
  Object.entries(offering?.options?.options || {})
    .filter(([, option]: [string, any]) => option?.type === 'component_formula')
    .map(([key, option]: [string, any]) => ({
      value: key,
      label: `${option.label || key} (${key})`,
    }));

export const OPTION_FORM_ID = 'OptionDialog';
