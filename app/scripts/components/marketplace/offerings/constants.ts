import { FieldType } from './types';

export const FORM_ID = 'marketplaceOfferingCreate';

export const PRICE_UNITS = [
  {
    label: 'Per month',
    value: 'month',
  },
  {
    label: 'Per half month',
    value: 'half_month',
  },
  {
    label: 'Per day',
    value: 'day',
  },
  {
    label: 'Quantity',
    value: 'quantity',
  },
];

export const FIELD_TYPES: Array<{value: FieldType, label: string}> = [
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
    value: 'select_openstack_tenant',
    label: 'Select OpenStack tenant',
  },
];
