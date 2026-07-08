import { ReactNode } from 'react';
import { OptionField, OptionFieldTypeEnum } from 'waldur-js-client';

import { formatDate, formatTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { FormattedHtml } from '@/core/FormattedHtml';
import { translate } from '@/i18n';

// OpenStack tenant/instance selectors submit the backend_id string (or an
// array of them). Legacy records may still hold the full option object, so
// fall back to its backend_id/value for backwards compatibility.
const toBackendId = (value) =>
  value && typeof value === 'object'
    ? (value.backend_id ?? value.value)
    : value;

const OptionValueRenders: Record<OptionFieldTypeEnum, (value) => ReactNode> = {
  integer: (value) => value,
  text: (value) => value,
  string: (value) => value,
  select_string: (value) => value,
  select_string_multi: (value) => value.join(', '),
  select_openstack_tenant: (value) => toBackendId(value),
  select_openstack_instance: (value) => toBackendId(value),
  select_multiple_openstack_tenants: (value) =>
    (value || []).map(toBackendId).join(', '),
  select_multiple_openstack_instances: (value) =>
    (value || []).map(toBackendId).join(', '),
  boolean: (value) => (value === true ? translate('Yes') : translate('No')),
  html_text: (value) => <FormattedHtml html={value} />,
  money: (value) => defaultCurrency(value),
  date: (value) => formatDate(value),
  time: (value) => formatTime(value),
  conditional_cascade: (value) => value,
  component_multiplier: (value) => value,
  storage_folder_manager: (value) => {
    if (typeof value === 'object' && value !== null) {
      return `${value.storage_data_type || ''} - ${value.permissions || ''}`;
    }
    return value;
  },
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
    const renderedValue = Renderer(value);
    if (typeof renderedValue === 'object' && renderedValue !== null) {
      return JSON.stringify(renderedValue);
    }
    return renderedValue;
  }
  return 'N/A';
};
