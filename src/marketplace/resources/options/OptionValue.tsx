import { ReactNode } from 'react';

import { formatDate, formatTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { isEmpty } from '@waldur/marketplace/offerings/update/components/OptionalNumberField';
import { FieldType } from '@waldur/marketplace/offerings/update/options/types';
import { OptionField } from '@waldur/marketplace/types';

const OptionValueRenders: Record<FieldType, (value) => ReactNode> = {
  integer: (value) => value,
  text: (value) => value,
  string: (value) => value,
  select_string: (value) => value,
  select_string_multi: (value) => value.join(', '),
  select_openstack_tenant: (value) => value.value,
  select_openstack_instance: (value) => value.value,
  select_multiple_openstack_tenants: (value) =>
    value.map(({ value }) => value).join(', '),
  select_multiple_openstack_instances: (value) =>
    value.map(({ value }) => value).join(', '),
  boolean: (value) => (value === true ? translate('Yes') : translate('No')),
  html_text: (value) => <FormattedHtml html={value} />,
  money: (value) => defaultCurrency(value),
  date: (value) => formatDate(value),
  time: (value) => formatTime(value),
};

export const OptionValue = ({
  option,
  value,
}: {
  option: OptionField;
  value;
}) => {
  if (isEmpty(value)) {
    return 'N/A';
  }
  const Renderer = OptionValueRenders[option.type];
  if (Renderer) {
    return Renderer(value);
  }
  return 'N/A';
};
