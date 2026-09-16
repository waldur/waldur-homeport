import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionContext } from '@/resource/actions/types';

import { listToDict } from '../core/utils';

const quotaNames = {
  storage: 'disk',
  vcpu: 'cores',
};

const parseQuotaName = (name) => quotaNames[name] || name;

export const parseQuotas = listToDict(
  (item) => parseQuotaName(item.name),
  (item) => item.limit,
);

export const parseQuotasUsage = listToDict(
  (item) => parseQuotaName(item.name),
  (item) => item.usage,
);

const PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A: 10.0.0.0/8 - 10.255.255.255/32
  '(^(10)(.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}.([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([89]|[12][0-9]|3[0-2])$)' +
    // Class B: 172.16.0.0/12 - 172.31.255.255/32
    '|(^(172).(1[6-9]|2[0-9]|3[0-1])(.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9])).([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/(1[2-9]|2[0-9]|3[0-2])$)' +
    // Class C: 192.168.0.0/16 - 192.168.255.255/32
    '|(^(192).(168)(.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])).([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/(1[6-9]|2[0-9]|3[0-2])$)',
);

const VOLUME_NAME_PATTERN = new RegExp('^[A-Za-z0-9\\-]+$');

const IPv4_ADDRESS_PATTERN =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;

export const validateIPv4 = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(IPv4_ADDRESS_PATTERN)) {
    return translate('Enter IPv4 address.');
  }
};

const IPv6_GROUP_PATTERN = /^[0-9a-f]{1,4}$/i;

/** Any RFC 4291 text form: eight groups, one `::` run standing for the
 * missing ones, and an optional dotted-quad tail. A zone index (`%eth0`) is
 * rejected, since it names a link on one host and Neutron cannot store it. */
export const isIPv6Address = (value: string): boolean => {
  if (!value || !value.includes(':')) {
    return false;
  }
  let text = value;
  const tailStart = text.lastIndexOf(':') + 1;
  const tail = text.slice(tailStart);
  if (tail.includes('.')) {
    if (!IPv4_ADDRESS_PATTERN.test(tail)) {
      return false;
    }
    // The dotted quad stands for the last two groups.
    text = `${text.slice(0, tailStart)}0:0`;
  }
  const halves = text.split('::');
  if (halves.length > 2) {
    return false;
  }
  const groups = halves.flatMap((half) => (half === '' ? [] : half.split(':')));
  if (!groups.every((group) => IPv6_GROUP_PATTERN.test(group))) {
    return false;
  }
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
};

// Not exported: the family-aware validators below are the entry points, and an
// unused export trips the dependency check.
const validateIPv6 = (value) => {
  if (!value) {
    return;
  }
  if (!isIPv6Address(value)) {
    return translate('Enter IPv6 address.');
  }
};

/** Only an IPv6 address contains a colon, so the family is known from the
 * first one typed, well before the CIDR as a whole is valid. */
export const getCidrIpVersion = (cidr?: string): 4 | 6 =>
  cidr?.includes(':') ? 6 : 4;

/** The prefix length is required: without one the API reads the address as a
 * single-host /32 or /128 network, which is never what a subnet means. */
export const parseSubnetCidr = (
  value?: string,
): { version: 4 | 6; prefix: number } | null => {
  const match = /^([^/]+)\/(\d{1,3})$/.exec(value || '');
  if (!match) {
    return null;
  }
  const [, address, prefixText] = match;
  const prefix = Number(prefixText);
  if (IPv4_ADDRESS_PATTERN.test(address)) {
    return prefix <= 32 ? { version: 4, prefix } : null;
  }
  if (isIPv6Address(address)) {
    return prefix <= 128 ? { version: 6, prefix } : null;
  }
  return null;
};

export const validateSubnetCidr = (value) => {
  if (!value) {
    return;
  }
  if (!value.includes('/')) {
    return translate(
      'Include the prefix length, for example 192.168.42.0/24 or 2001:db8::/64.',
    );
  }
  if (!parseSubnetCidr(value)) {
    return translate('Enter a network address in CIDR format.');
  }
};

/** Neutron rejects a gateway, nameserver or next hop of the other family than
 * the subnet. Field validators receive the whole form, so the family follows
 * the CIDR as it is edited without the validator changing identity. */
export const validateIpInSubnetFamily = (value, allValues?) =>
  getCidrIpVersion(allValues?.cidr) === 6
    ? validateIPv6(value)
    : validateIPv4(value);

// Not exported either: the two validators below are what the forms use, and
// they apply this to the IPv4 half.
const validatePrivateCIDR = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(PRIVATE_CIDR_PATTERN)) {
    return translate('Enter private IPv4 CIDR.');
  }
};

/** The CIDR a new tenant's default subnet gets.
 *
 * IPv4 stays bounded to the private ranges. An IPv6 default subnet uses SLAAC,
 * since an order carries no address modes, and Neutron only allows SLAAC on a
 * /64 -- so the API refuses any other prefix and the form can say so first.
 */
export const validateTenantSubnetCidr = (value) => {
  if (!value) {
    return;
  }
  if (getCidrIpVersion(value) === 4) {
    return validatePrivateCIDR(value);
  }
  const invalid = validateSubnetCidr(value);
  if (invalid) {
    return invalid;
  }
  if (parseSubnetCidr(value)?.prefix !== 64) {
    return translate(
      'An IPv6 default subnet uses SLAAC, which needs a /64 prefix, because instances build their address from it.',
    );
  }
};

// Ranges an address pair may never overlap, whatever the port's subnets are.
const FORBIDDEN_IPV6_PAIR_PREFIXES = [
  { test: (a: string) => a === '::', description: 'the unspecified address' },
  { test: (a: string) => a === '::1', description: 'the loopback address' },
  {
    test: (a: string) => a.startsWith('::ffff:'),
    description: 'IPv4-mapped addresses',
  },
  {
    test: (a: string) => /^fe[89ab]/.test(a),
    description: 'link-local addresses',
  },
  { test: (a: string) => a.startsWith('ff'), description: 'multicast' },
];

/** One entry of a port's allowed address pairs.
 *
 * IPv4 stays bounded to the private ranges. IPv6 is accepted unless it is one
 * of the ranges the API always refuses; whether it is a unique local address
 * or sits inside one of the tenant's own subnets needs the tenant's subnets,
 * which this dialog does not hold, so the API remains the authority there.
 */
export const validateAllowedAddressPair = (value) => {
  if (!value) {
    return;
  }
  if (getCidrIpVersion(value) === 4) {
    return validatePrivateCIDR(value);
  }
  const [address, prefixText] = value.split('/');
  if (!isIPv6Address(address)) {
    return translate('Enter IPv6 address.');
  }
  if (prefixText !== undefined) {
    const prefix = Number(prefixText);
    if (!/^\d{1,3}$/.test(prefixText) || prefix > 128) {
      return translate('Enter a network address in CIDR format.');
    }
    if (prefix === 0) {
      return translate(
        '::/0 covers every address, which would let this port answer for all of them.',
      );
    }
  }
  const lowercased = address.toLowerCase();
  const forbidden = FORBIDDEN_IPV6_PAIR_PREFIXES.find((range) =>
    range.test(lowercased),
  );
  if (forbidden) {
    return translate('An address pair cannot cover {description}.', {
      description: forbidden.description,
    });
  }
};

const volumeName = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate(
      'Name is too short, names should be at least two alphanumeric characters.',
    );
  }
  if (!value.match(VOLUME_NAME_PATTERN)) {
    return translate(
      'Name should consist of latin symbols, numbers and dashes.',
    );
  }
};

export const getVolumeNameValidators = () => {
  const validators = [required];
  if (ENV.enforceLatinName) {
    validators.push(volumeName);
  }
  return validators;
};

export const validateOpenStackInstancePowerPermission = (
  ctx: ActionContext,
) => {
  if (ctx.user?.is_staff) {
    return;
  }

  const resource = ctx.resource;
  if (!resource) {
    return translate('Resource not found.');
  }

  const hasProjectPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE_POWER,
    projectId: resource.project_uuid,
  });

  const hasCustomerPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE_POWER,
    customerId: resource.customer_uuid,
  });

  if (!hasProjectPermission && !hasCustomerPermission) {
    return translate(
      'You do not have permission to manage power operations for this instance.',
    );
  }
};

export const validateOpenStackInstanceManagePermission = (
  ctx: ActionContext,
) => {
  if (ctx.user?.is_staff) {
    return;
  }

  const resource = ctx.resource;
  if (!resource) {
    return translate('Resource not found.');
  }

  const hasProjectPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE,
    projectId: resource.project_uuid,
  });

  const hasCustomerPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE,
    customerId: resource.customer_uuid,
  });

  if (!hasProjectPermission && !hasCustomerPermission) {
    return translate('You do not have permission to manage this instance.');
  }
};

export const validateOpenStackInstanceConsolePermission = (
  ctx: ActionContext,
) => {
  if (ctx.user?.is_staff) {
    return;
  }

  const resource = ctx.resource;
  if (!resource) {
    return translate('Resource not found.');
  }

  if (
    !ENV.plugins.WALDUR_OPENSTACK.ALLOW_CUSTOMER_USERS_OPENSTACK_CONSOLE_ACCESS
  ) {
    return translate('Console access is not allowed for customer users.');
  }

  const hasProjectPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.HAS_OPENSTACK_INSTANCE_CONSOLE_ACCESS,
    projectId: resource.project_uuid,
  });

  const hasCustomerPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.HAS_OPENSTACK_INSTANCE_CONSOLE_ACCESS,
    customerId: resource.customer_uuid,
  });

  if (!hasProjectPermission && !hasCustomerPermission) {
    return translate(
      'You do not have permission to access the console for this instance.',
    );
  }
};
