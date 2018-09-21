import { translate } from '@waldur/i18n';

import { FieldType } from './types';

export const getBillingPeriods = () => ([
  {
    label: translate('Per month'),
    value: 'month',
  },
  {
    label: translate('Per half month'),
    value: 'half_month',
  },
  {
    label: translate('Per day'),
    value: 'day',
  },
]);

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
