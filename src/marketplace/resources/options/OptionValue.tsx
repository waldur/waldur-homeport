import { ReactNode } from 'react';
import {
  OptionField,
  OptionFieldTypeEnum,
  ResourceOptionSecretStatus,
} from 'waldur-js-client';

import { formatDate, formatTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { FormattedHtml } from '@/core/FormattedHtml';
import { translate } from '@/i18n';
import { formatCidrValue } from '@/marketplace/common/cidrOptions';
import { formatIpsecValue } from '@/marketplace/common/ipsecVpn';
import { formatEgressRules } from '@/marketplace/common/k8sEgressRules';
import { isAllModels } from '@/marketplace/common/modelSelection';
import { isEmptyOptionValue } from '@/marketplace/common/requiredOptions';
import { formatSecretStatus } from '@/marketplace/common/secretOptions';

// OpenStack tenant/instance selectors submit the backend_id string (or an
// array of them). Legacy records may still hold the full option object, so
// fall back to its backend_id/value for backwards compatibility.
const toBackendId = (value) =>
  value && typeof value === 'object'
    ? (value.backend_id ?? value.value)
    : value;

const countRules = (value, key: string) =>
  Array.isArray(value?.[key]) ? value[key].length : 0;

/**
 * A cluster configuration in one line: version, topology, sites, the number
 * of inbound rules, and the outbound destinations in full, as those decide
 * what the cluster can reach.
 */
const formatK8sConfig = (value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }
  const parts: string[] = [];
  if (value.kubernetes_version) {
    parts.push(
      translate('Kubernetes {version}', { version: value.kubernetes_version }),
    );
  }
  if (value.topology) {
    parts.push(
      value.topology === '3-datacenter'
        ? translate('Three sites')
        : value.topology === '1-datacenter'
          ? translate('Single site')
          : value.topology,
    );
  }
  if (Array.isArray(value.datacenters)) {
    parts.push(
      translate('Datacenters: {count}', { count: value.datacenters.length }),
    );
  }
  parts.push(
    translate('Inbound rules: {count}', {
      count:
        countRules(value, 'public_access_rules') +
        countRules(value, 'administrative_access_rules'),
    }),
  );
  parts.push(
    translate('Egress: {rules}', {
      rules: formatEgressRules(value.egress_rules),
    }),
  );
  return parts.join(' · ');
};

const OptionValueRenders: Record<OptionFieldTypeEnum, (value) => ReactNode> = {
  integer: (value) => value,
  text: (value) => value,
  string: (value) => value,
  select_string: (value) => value,
  // A lone * is only ever valid in a resource's model selection; an empty
  // selection there is no model, not a missing value.
  select_string_multi: (value) =>
    isAllModels(value)
      ? translate('All models')
      : value.length
        ? value.join(', ')
        : translate('None'),
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
  component_formula: (value) => value,
  // Never stored: the server drops any value sent for it.
  component_sum: () => null,
  storage_folder_manager: (value) => {
    if (typeof value === 'object' && value !== null) {
      return `${value.storage_data_type || ''} - ${value.permissions || ''}`;
    }
    return value;
  },
  k8s_cluster_config: formatK8sConfig,
  k8s_egress_rules: (value) =>
    formatEgressRules(Array.isArray(value) ? value : []),
  cidr: (value) => formatCidrValue(value),
  ipsec_vpn_config: (value) => formatIpsecValue(value),
  // Never the value: a typed secret, as in an order's summary, reads "Set".
  secret: () => formatSecretStatus({ is_set: true }),
};

// Ends of blocks and lines become spaces first, so "<p>Line one</p><p>Line
// two</p>" reads "Line one Line two". DOMParser builds an inert document:
// nothing in it runs or loads. textContent decodes the entities.
const BLOCK_BOUNDARY = /<\/(p|div|li|h[1-6])\s*>|<br\s*\/?>/gi;

const htmlToPlainText = (html: string) =>
  (
    new DOMParser().parseFromString(
      html.replace(BLOCK_BOUNDARY, (boundary) => `${boundary} `),
      'text/html',
    ).body.textContent ?? ''
  )
    .replace(/\s+/g, ' ')
    .trim();

// Stored values do not always have the shape their option says.
const MULTI_TYPES = [
  'select_string_multi',
  'select_multiple_openstack_tenants',
  'select_multiple_openstack_instances',
];

/**
 * The value as plain text, for places that cannot render markup: a one-line
 * summary, a PDF. Null when there is nothing to show — an empty multiple
 * choice included, which would otherwise read "None" in a summary.
 */
export const formatOptionValue = (
  option: Pick<OptionField, 'type'> | null | undefined,
  value,
): string | null => {
  if (
    isEmptyOptionValue(value) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return null;
  }
  if (option?.type === 'html_text') {
    return htmlToPlainText(String(value)) || null;
  }
  if (MULTI_TYPES.includes(option?.type) && !Array.isArray(value)) {
    value = [value];
  }
  const render = option?.type ? OptionValueRenders[option.type] : undefined;
  const rendered = render ? render(value) : value;
  if (isEmptyOptionValue(rendered)) {
    return null;
  }
  return typeof rendered === 'object'
    ? JSON.stringify(rendered)
    : String(rendered);
};

export const OptionValue = ({
  option,
  value,
  secretStatus,
}: {
  option: OptionField;
  value;
  /** Whether a secret option is set, from the resource's option_secrets. */
  secretStatus?: ResourceOptionSecretStatus;
}) => {
  // A stored secret has no value to show; its status says whether it is set.
  if (option.type === 'secret') {
    return formatSecretStatus(
      secretStatus ?? { is_set: !isEmptyOptionValue(value) },
    );
  }
  if (isEmptyOptionValue(value)) {
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
