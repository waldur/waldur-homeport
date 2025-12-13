import { ReactNode } from 'react';
import { OptionField, OptionFieldTypeEnum } from 'waldur-js-client';

import { formatDate, formatTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';

const OptionValueRenders: Record<OptionFieldTypeEnum, (value) => ReactNode> = {
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
  conditional_cascade: (value) => value,
  component_multiplier: (value) => value,
  single_datacenter_k8s_config: (value) => JSON.stringify(value),
  multi_datacenter_k8s_config: (value) => JSON.stringify(value),
};

const isEmpty = (value) =>
  value === '' || value === null || typeof value === 'undefined';

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
