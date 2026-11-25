import type {
  K8sDefaultConfiguration,
  K8sEgressRule as ApiK8sEgressRule,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  validateIPv4CIDR,
  validateIPv6CIDR,
} from '@/openstack/openstack-security-groups/rule-editor/CIDRField';

/**
 * An outbound destination a Kubernetes cluster may reach. `uuid` only tells
 * rows apart in the form; the server stores it as given and ignores it.
 */
export type K8sEgressRule = ApiK8sEgressRule & { uuid?: string };

export type K8sEgressPolicy = Pick<
  K8sDefaultConfiguration,
  | 'egress_rules_enabled'
  | 'egress_domain_rules_allowed'
  | 'egress_baseline_rules'
>;

const DOMAIN_LABEL = '(?!-)[a-z0-9-]{1,63}(?<!-)';
// The last label holds a letter, so an IP address is not taken for a name.
const DOMAIN_TOP_LABEL = '(?!-)(?=[a-z0-9-]*[a-z])[a-z0-9-]{1,63}(?<!-)';
// Two or more labels, optionally led by a "*." wildcard; mirrors the server.
const DOMAIN_PATTERN = new RegExp(
  `^(\\*\\.)?(?:${DOMAIN_LABEL}\\.)+${DOMAIN_TOP_LABEL}$`,
  'i',
);
const MAX_DOMAIN_LENGTH = 253;

export const getProtocolOptions = () => [
  { value: '', label: translate('Any') },
  { value: 'TCP', label: 'TCP' },
  { value: 'UDP', label: 'UDP' },
  { value: 'ICMP', label: 'ICMP' },
];

export const getDestinationTypeOptions = (allowDomains: boolean) => [
  { value: 'cidr', label: translate('Network') },
  ...(allowDomains ? [{ value: 'domain', label: translate('Domain') }] : []),
];

/** An IPv4 or IPv6 network with its prefix length, such as 10.0.0.0/8. */
const isValidEgressCidr = (value: string) =>
  Boolean(value) && (!validateIPv4CIDR(value) || !validateIPv6CIDR(value));

const isValidEgressDomain = (value: string) =>
  Boolean(value) &&
  value.length <= MAX_DOMAIN_LENGTH &&
  DOMAIN_PATTERN.test(value);

export const validateEgressDestination = (
  type: K8sEgressRule['destination_type'],
  destination: string,
): string | undefined => {
  if (!destination) {
    return translate('Enter a destination.');
  }
  if (type === 'domain') {
    return isValidEgressDomain(destination)
      ? undefined
      : translate(
          'Enter a domain name, such as registry.example.com, or a wildcard such as *.example.com.',
        );
  }
  return isValidEgressCidr(destination)
    ? undefined
    : translate(
        'Enter an IPv4 or IPv6 network, such as 10.0.0.0/8 or 2001:db8::/32.',
      );
};

const hasPort = (port: number | null | undefined) =>
  port !== null && port !== undefined && !Number.isNaN(port);

/** The first problem with a rule, worded for the customer; undefined if none. */
export const validateEgressRule = (
  rule: K8sEgressRule,
  allowDomains: boolean,
): string | undefined => {
  if (!rule.name?.trim()) {
    return translate('Enter a name.');
  }
  if (rule.destination_type === 'domain' && !allowDomains) {
    return translate('This offering accepts network destinations only.');
  }
  const destinationError = validateEgressDestination(
    rule.destination_type,
    rule.destination,
  );
  if (destinationError) {
    return destinationError;
  }
  const min = rule.port_range_min;
  const max = rule.port_range_max;
  if (!hasPort(min) && hasPort(max)) {
    return translate('Set the first port of the range too.');
  }
  for (const port of [min, max]) {
    if (hasPort(port) && (port < 1 || port > 65535)) {
      return translate('Ports go from 1 to 65535.');
    }
  }
  if (hasPort(min) && hasPort(max) && min > max) {
    return translate('The last port must not be lower than the first one.');
  }
  if (rule.protocol === 'ICMP' && hasPort(min)) {
    return translate('ICMP has no ports.');
  }
  return undefined;
};

/**
 * Problems with the customer's egress rules under the offering's policy,
 * one message per rule that has one.
 */
export const validateEgressRules = (
  rules: K8sEgressRule[] | undefined,
  policy: K8sEgressPolicy | undefined,
): string[] => {
  if (!rules?.length) {
    return [];
  }
  if (!policy?.egress_rules_enabled) {
    return [translate('This offering does not accept egress rules.')];
  }
  return rules.flatMap((rule, index) => {
    const error = validateEgressRule(
      rule,
      Boolean(policy.egress_domain_rules_allowed),
    );
    return error
      ? [
          translate('Egress rule {name}: {error}', {
            name: rule.name?.trim() || index + 1,
            error,
          }),
        ]
      : [];
  });
};

/** "443", "8000-8100", or "any port". */
export const formatEgressPorts = (rule: K8sEgressRule) => {
  if (!hasPort(rule.port_range_min)) {
    return translate('any port');
  }
  return hasPort(rule.port_range_max) &&
    rule.port_range_max !== rule.port_range_min
    ? `${rule.port_range_min}-${rule.port_range_max}`
    : String(rule.port_range_min);
};

/** "Registry: *.docker.io (TCP 443)", "Storage: 10.20.0.0/16 (any traffic)". */
export const formatEgressRule = (rule: K8sEgressRule) => {
  const traffic =
    !rule.protocol && !hasPort(rule.port_range_min)
      ? translate('any traffic')
      : rule.protocol === 'ICMP'
        ? 'ICMP'
        : `${rule.protocol || translate('any protocol')} ${formatEgressPorts(rule)}`;
  const target = `${rule.destination} (${traffic})`;
  return rule.name ? `${rule.name}: ${target}` : target;
};

/** The rules on one line; "Unrestricted" when there are none. */
export const formatEgressRules = (rules: K8sEgressRule[] | undefined) =>
  rules?.length
    ? rules.map(formatEgressRule).join('; ')
    : translate('Unrestricted');

let nextRuleId = 0;

/** A row id that stays unique within the page. */
const newEgressRuleId = () => `egress-${Date.now()}-${nextRuleId++}`;

export const createEgressRule = (): K8sEgressRule => ({
  uuid: newEgressRuleId(),
  name: '',
  destination_type: 'cidr',
  destination: '',
  protocol: '',
  port_range_min: null,
  port_range_max: null,
  description: '',
});
