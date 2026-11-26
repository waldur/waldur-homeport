import type { CidrPolicy, OptionDefaultConfigs } from 'waldur-js-client';

import { translate } from '@/i18n';

import {
  formatNetwork,
  IpNetwork,
  isSubnetOf,
  maxPrefixLength,
  networksOverlap,
  parseNetwork,
} from './ipNetworks';

/** The default_configs of a cidr option. */
export type CidrOptionPolicy = Pick<
  OptionDefaultConfigs,
  | 'ip_version'
  | 'prefix_length_min'
  | 'prefix_length_max'
  | 'allowed_ranges'
  | 'excluded_ranges'
  | 'multiple'
  | 'max_items'
>;

/** A cidr option's value: one network, or a list of them with `multiple`. */
export type CidrValue = string | string[];

// The server refuses a longer list even without max_items: entries are
// compared with each other for overlaps.
export const MAX_CIDR_ITEMS = 256;

const VERSION_NUMBERS = { ipv4: 4, ipv6: 6 } as const;

const getCidrFormatError = () =>
  translate('Enter a network in CIDR notation, such as 10.0.0.0/16.');

/** Networks of a stored policy; one the server would refuse is skipped. */
const policyNetworks = (ranges: string[] | undefined): IpNetwork[] =>
  (ranges || []).flatMap((range) => {
    const { network } = parseNetwork(range);
    return network ? [network] : [];
  });

/**
 * The network `value` writes, or why the policy refuses it. Mirrors
 * `CidrPolicy.clean_network` in Mastermind, message for message.
 */
export const checkNetwork = (
  value: string,
  policy: CidrPolicy = {},
):
  | { network: IpNetwork; error?: undefined }
  | { network?: undefined; error: string } => {
  const { network, hostBits } = parseNetwork(value);
  if (!network) {
    return { error: getCidrFormatError() };
  }
  if (hostBits) {
    return {
      error: translate('{value} has host bits set. Did you mean {network}?', {
        value: value.trim(),
        network: formatNetwork(network),
      }),
    };
  }
  const version = VERSION_NUMBERS[policy.ip_version as 'ipv4' | 'ipv6'];
  if (version && network.version !== version) {
    return { error: translate('Enter an IPv{version} network.', { version }) };
  }
  if (
    policy.prefix_length_min != null &&
    network.prefix < policy.prefix_length_min
  ) {
    return {
      error: translate(
        'The network is too large: the prefix length must be at least /{length}.',
        { length: policy.prefix_length_min },
      ),
    };
  }
  if (
    policy.prefix_length_max != null &&
    network.prefix > policy.prefix_length_max
  ) {
    return {
      error: translate(
        'The network is too small: the prefix length must be at most /{length}.',
        { length: policy.prefix_length_max },
      ),
    };
  }
  const allowed = policyNetworks(policy.allowed_ranges);
  if (allowed.length && !allowed.some((range) => isSubnetOf(network, range))) {
    return {
      error: translate(
        '{network} is not inside the allowed ranges: {ranges}.',
        {
          network: formatNetwork(network),
          ranges: allowed.map(formatNetwork).join(', '),
        },
      ),
    };
  }
  const excluded = policyNetworks(policy.excluded_ranges).find((range) =>
    networksOverlap(network, range),
  );
  if (excluded) {
    return {
      error: translate('{network} overlaps the excluded range {range}.', {
        network: formatNetwork(network),
        range: formatNetwork(excluded),
      }),
    };
  }
  return { network };
};

export const validateNetwork = (value: string, policy: CidrPolicy = {}) =>
  checkNetwork(value, policy).error;

export interface CidrListErrors {
  /** Per entry, in order; undefined where the entry is fine. */
  items: Array<string | undefined>;
  /** About the list as a whole: its length, or two entries overlapping. */
  list?: string;
}

/**
 * Problems with a list of networks. Mirrors `CidrPolicy.clean_networks`: the
 * length first, then each entry, then overlaps between entries.
 */
export const validateNetworkList = (
  values: string[] | undefined,
  policy: CidrPolicy = {},
  { allowEmpty = true }: { allowEmpty?: boolean } = {},
): CidrListErrors => {
  const list = values || [];
  if (!list.length && !allowEmpty) {
    return { items: [], list: translate('Enter at least one network.') };
  }
  const limit = Math.min(policy.max_items || MAX_CIDR_ITEMS, MAX_CIDR_ITEMS);
  if (list.length > limit) {
    return {
      items: [],
      list: translate('Enter at most {count} networks.', { count: limit }),
    };
  }
  const checked = list.map((value) => checkNetwork(value, policy));
  const items = checked.map((result) => result.error);
  if (items.some(Boolean)) {
    return { items };
  }
  const networks = checked.map((result) => result.network as IpNetwork);
  for (let index = 0; index < networks.length; index++) {
    const other = networks
      .slice(0, index)
      .find((earlier) => networksOverlap(networks[index], earlier));
    if (other) {
      return {
        items,
        list: translate('{network} overlaps {other}.', {
          network: formatNetwork(networks[index]),
          other: formatNetwork(other),
        }),
      };
    }
  }
  return { items };
};

/** The problems of a list as messages, entries named by their position. */
export const formatNetworkListErrors = (
  errors: CidrListErrors,
  itemLabel = (position: number) =>
    translate('Network {position}', { position }),
): string[] => [
  ...errors.items.flatMap((error, index) =>
    error ? [`${itemLabel(index + 1)}: ${error}`] : [],
  ),
  ...(errors.list ? [errors.list] : []),
];

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/**
 * The problems of a cidr option's value under its policy, for the form; the
 * server checks the same. An empty value is left to `required`, except an
 * empty list, which `required` lets through.
 */
export const validateCidrValue = (
  value: CidrValue | undefined,
  policy: CidrOptionPolicy = {},
  required = false,
): string | string[] | undefined => {
  if (isEmpty(value)) {
    return required && policy.multiple
      ? translate('Enter at least one network.')
      : undefined;
  }
  if (policy.multiple) {
    const errors = formatNetworkListErrors(
      validateNetworkList(
        Array.isArray(value) ? value : [value as string],
        policy,
        { allowEmpty: !required },
      ),
    );
    return errors.length ? errors : undefined;
  }
  if (Array.isArray(value)) {
    return translate('Enter a single network.');
  }
  return validateNetwork(value, policy);
};

/**
 * The policy in a few words, for the help text of the field: "IPv4, prefix
 * /16 to /28, inside 10.0.0.0/8, not overlapping 10.96.0.0/12, up to 5
 * networks". Empty when the policy accepts any network.
 */
export const describeCidrPolicy = (policy: CidrOptionPolicy = {}): string => {
  const parts: string[] = [];
  if (policy.ip_version === 'ipv4') {
    parts.push(translate('IPv4'));
  } else if (policy.ip_version === 'ipv6') {
    parts.push(translate('IPv6'));
  }
  const min = policy.prefix_length_min;
  const max = policy.prefix_length_max;
  if (min != null && max != null) {
    parts.push(
      min === max
        ? translate('prefix /{length}', { length: min })
        : translate('prefix /{min} to /{max}', { min, max }),
    );
  } else if (min != null) {
    parts.push(translate('prefix /{length} or longer', { length: min }));
  } else if (max != null) {
    parts.push(translate('prefix /{length} or shorter', { length: max }));
  }
  if (policy.allowed_ranges?.length) {
    parts.push(
      translate('inside {ranges}', {
        ranges: policy.allowed_ranges.join(', '),
      }),
    );
  }
  if (policy.excluded_ranges?.length) {
    parts.push(
      translate('not overlapping {ranges}', {
        ranges: policy.excluded_ranges.join(', '),
      }),
    );
  }
  if (policy.multiple && policy.max_items) {
    parts.push(
      translate('up to {count} networks', { count: policy.max_items }),
    );
  }
  const text = parts.join(', ');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
};

/** "10.20.0.0/16", or a list joined with commas. */
export const formatCidrValue = (value: CidrValue | undefined | null) =>
  Array.isArray(value) ? value.join(', ') : value || '';

type CidrPolicyErrors = Partial<Record<keyof CidrOptionPolicy, string>>;

/**
 * Problems with a cidr policy as a provider saves it, keyed like the policy.
 * Mirrors `validate_cidr_policy` in Mastermind.
 */
export const validateCidrPolicy = (
  policy: CidrOptionPolicy | undefined,
): CidrPolicyErrors | undefined => {
  const configs = policy || {};
  const errors: CidrPolicyErrors = {};
  const version = VERSION_NUMBERS[configs.ip_version as 'ipv4' | 'ipv6'];
  const highest = version === 4 ? 32 : 128;
  for (const key of ['prefix_length_min', 'prefix_length_max'] as const) {
    const length = configs[key];
    if (
      length != null &&
      (!Number.isInteger(length) || length < 0 || length > highest)
    ) {
      errors[key] = translate('Enter a prefix length from 0 to {max}.', {
        max: highest,
      });
    }
  }
  const low = configs.prefix_length_min;
  const high = configs.prefix_length_max;
  if (
    !Object.keys(errors).length &&
    low != null &&
    high != null &&
    low > high
  ) {
    errors.prefix_length_max = translate(
      'The largest prefix length must not be lower than the smallest.',
    );
  }
  for (const key of ['allowed_ranges', 'excluded_ranges'] as const) {
    for (const range of configs[key] || []) {
      const result = checkNetwork(range);
      if (result.error) {
        errors[key] = result.error;
        break;
      }
      if (version && result.network.version !== version) {
        errors[key] = translate('{network} is not an IPv{version} network.', {
          network: range,
          version,
        });
        break;
      }
    }
  }
  const maxItems = configs.max_items;
  if (maxItems != null && (!Number.isInteger(maxItems) || maxItems < 1)) {
    errors.max_items = translate('Enter a whole number, 1 or more.');
  } else if (maxItems != null && maxItems > MAX_CIDR_ITEMS) {
    errors.max_items = translate('Enter at most {count}.', {
      count: MAX_CIDR_ITEMS,
    });
  }
  return Object.keys(errors).length ? errors : undefined;
};

/** The example network within the policy, built on `base`. */
const fitExample = (base: IpNetwork, policy: CidrPolicy) => {
  // Never shorter than the base itself, which would leave it.
  const prefix = Math.max(
    base.prefix,
    Math.min(
      Math.max(base.prefix, policy.prefix_length_min ?? 0),
      policy.prefix_length_max ?? maxPrefixLength(base.version),
    ),
  );
  return formatNetwork({ ...base, prefix });
};

const EXAMPLE_BASES = [
  '10.0.0.0/16',
  '192.168.10.0/24',
  '172.16.10.0/24',
  '10.200.0.0/16',
  'fd00:1::/64',
  'fd00:2::/64',
];

/**
 * An example network for a placeholder: one the policy accepts and that
 * overlaps none of `avoid`, such as the provider's own subnets, which would
 * read like a suggestion to reuse them. Empty when there is none.
 */
export const getCidrPlaceholder = (
  policy: CidrPolicy = {},
  avoid: string[] = [],
) => {
  const taken = avoid.flatMap((item) => {
    const network = parseNetwork(item).network;
    return network ? [network] : [];
  });
  const candidates = [
    ...(policy.allowed_ranges || []),
    ...(policy.ip_version === 'ipv6'
      ? EXAMPLE_BASES.filter((base) => base.includes(':'))
      : EXAMPLE_BASES),
  ];
  for (const candidate of candidates) {
    const base = parseNetwork(candidate).network;
    if (!base) {
      continue;
    }
    const example = fitExample(base, policy);
    const network = parseNetwork(example).network;
    if (
      network &&
      !validateNetwork(example, policy) &&
      !taken.some((other) => networksOverlap(network, other))
    ) {
      return example;
    }
  }
  return '';
};
