/**
 * IPv4 and IPv6 addresses and networks, parsed the way Mastermind's
 * `ipaddress` checks parse them, so the order form can refuse what the server
 * would refuse and say why before the customer submits.
 */

export type IpVersion = 4 | 6;

export interface IpAddress {
  version: IpVersion;
  value: bigint;
}

export interface IpNetwork {
  version: IpVersion;
  /** The network address, host bits cleared. */
  address: bigint;
  prefix: number;
}

const BITS: Record<IpVersion, number> = { 4: 32, 6: 128 };

// A decimal octet without leading zeros, which Python refuses as ambiguous.
const OCTET = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/;
const HEXTET = /^[0-9a-f]{1,4}$/i;
// An address with an explicit prefix length: no netmask form, no zone id.
const CIDR_SHAPE = /^[0-9a-f.:]+\/\d{1,3}$/i;

const parseIPv4 = (text: string): bigint | null => {
  const parts = text.split('.');
  if (parts.length !== 4 || !parts.every((part) => OCTET.test(part))) {
    return null;
  }
  return parts.reduce(
    (value, part) => (value << BigInt(8)) | BigInt(part),
    BigInt(0),
  );
};

const parseIPv6 = (text: string): bigint | null => {
  if (!text.includes(':') || text.includes('%')) {
    return null;
  }
  let body = text;
  // An IPv4 address may write the last 32 bits, as in ::ffff:192.0.2.1.
  let tail: number[] = [];
  const lastColon = text.lastIndexOf(':');
  const last = text.slice(lastColon + 1);
  if (last.includes('.')) {
    const ipv4 = parseIPv4(last);
    if (ipv4 === null) {
      return null;
    }
    tail = [Number(ipv4 >> BigInt(16)), Number(ipv4 & BigInt(0xffff))];
    body = text.slice(0, lastColon + 1);
    body = body.endsWith('::') ? body : body.slice(0, -1);
  }
  const halves = body.split('::');
  if (halves.length > 2) {
    return null;
  }
  const split = (part: string) => (part === '' ? [] : part.split(':'));
  const head = split(halves[0]);
  const rest = halves.length === 2 ? split(halves[1]) : [];
  if (![...head, ...rest].every((hextet) => HEXTET.test(hextet))) {
    return null;
  }
  const count = head.length + rest.length + tail.length;
  // "::" stands for at least one group of zeros.
  if (halves.length === 2 ? count > 7 : count !== 8) {
    return null;
  }
  const groups = [
    ...head.map((hextet) => parseInt(hextet, 16)),
    ...Array<number>(halves.length === 2 ? 8 - count : 0).fill(0),
    ...rest.map((hextet) => parseInt(hextet, 16)),
    ...tail,
  ];
  return groups.reduce(
    (value, group) => (value << BigInt(16)) | BigInt(group),
    BigInt(0),
  );
};

/** An IPv4 or IPv6 address, or null when `text` is not one. */
export const parseIpAddress = (text: string): IpAddress | null => {
  const trimmed = (text || '').trim();
  const ipv4 = parseIPv4(trimmed);
  if (ipv4 !== null) {
    return { version: 4, value: ipv4 };
  }
  const ipv6 = parseIPv6(trimmed);
  return ipv6 === null ? null : { version: 6, value: ipv6 };
};

const formatIPv4 = (value: bigint) =>
  [24, 16, 8, 0]
    .map((shift) => String((value >> BigInt(shift)) & BigInt(255)))
    .join('.');

/** RFC 5952: lower case, no leading zeros, the longest zero run as "::". */
const formatIPv6 = (value: bigint) => {
  const groups = [112, 96, 80, 64, 48, 32, 16, 0].map((shift) =>
    Number((value >> BigInt(shift)) & BigInt(0xffff)),
  );
  let bestStart = -1;
  let bestLength = 0;
  for (let start = 0; start < 8; start++) {
    let length = 0;
    while (start + length < 8 && groups[start + length] === 0) {
      length++;
    }
    if (length > bestLength) {
      bestStart = start;
      bestLength = length;
    }
  }
  const hex = groups.map((group) => group.toString(16));
  if (bestLength < 2) {
    return hex.join(':');
  }
  const head = hex.slice(0, bestStart).join(':');
  const rest = hex.slice(bestStart + bestLength).join(':');
  return `${head}::${rest}`;
};

const formatIpAddress = ({ version, value }: IpAddress) =>
  version === 4 ? formatIPv4(value) : formatIPv6(value);

export const formatNetwork = (network: IpNetwork) =>
  `${formatIpAddress({ version: network.version, value: network.address })}/${network.prefix}`;

const mask = (version: IpVersion, prefix: number) => {
  const bits = BITS[version];
  const all = (BigInt(1) << BigInt(bits)) - BigInt(1);
  return all ^ ((BigInt(1) << BigInt(bits - prefix)) - BigInt(1));
};

export type ParsedNetwork =
  | { network: IpNetwork; hostBits: boolean }
  | { network: null; hostBits: false };

/**
 * A network written with an explicit prefix length, such as 10.0.0.0/16.
 * `hostBits` tells that the address had bits set below the prefix; the
 * network is then the one the address lies in, which is what the customer
 * probably meant.
 */
export const parseNetwork = (text: string): ParsedNetwork => {
  const trimmed = (text || '').trim();
  if (!CIDR_SHAPE.test(trimmed)) {
    return { network: null, hostBits: false };
  }
  const [addressText, prefixText] = trimmed.split('/');
  const address = parseIpAddress(addressText);
  const prefix = parseInt(prefixText, 10);
  if (!address || prefix > BITS[address.version]) {
    return { network: null, hostBits: false };
  }
  const network = address.value & mask(address.version, prefix);
  return {
    network: { version: address.version, address: network, prefix },
    hostBits: network !== address.value,
  };
};

export const maxPrefixLength = (version: IpVersion) => BITS[version];

/** Whether the two networks share any address. */
export const networksOverlap = (first: IpNetwork, second: IpNetwork) => {
  if (first.version !== second.version) {
    return false;
  }
  const shift = BigInt(
    BITS[first.version] - Math.min(first.prefix, second.prefix),
  );
  return first.address >> shift === second.address >> shift;
};

/** Whether `network` lies inside `other`, or is it. */
export const isSubnetOf = (network: IpNetwork, other: IpNetwork) =>
  network.version === other.version &&
  network.prefix >= other.prefix &&
  networksOverlap(network, other);

/** The network of the one address. */
const hostNetwork = (address: IpAddress): IpNetwork => ({
  version: address.version,
  address: address.value,
  prefix: BITS[address.version],
});

const networks = (...items: string[]) =>
  items.map((item) => parseNetwork(item).network as IpNetwork);

// What Python's ipaddress calls loopback, link-local, multicast, reserved or
// unspecified, and the private and CGNAT ranges the server adds to them.
// Documentation ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24,
// 2001:db8::/32) are accepted, as on the server.
const NON_PUBLIC_IPV4 = networks(
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '224.0.0.0/4',
  '240.0.0.0/4',
);
const NON_PUBLIC_IPV6 = networks(
  '::/8',
  '100::/8',
  '200::/7',
  '400::/6',
  '800::/5',
  '1000::/4',
  '4000::/3',
  '6000::/3',
  '8000::/3',
  'a000::/3',
  'c000::/3',
  'e000::/4',
  'f000::/5',
  'f800::/6',
  'fc00::/7',
  'fe00::/9',
  'fe80::/10',
  'ff00::/8',
);
const IPV4_MAPPED = parseNetwork('::ffff:0:0/96').network as IpNetwork;

/** Whether a VPN peer at `address` can be reached over the internet. */
export const isPublicAddress = (address: IpAddress): boolean => {
  if (address.version === 6 && isSubnetOf(hostNetwork(address), IPV4_MAPPED)) {
    // An IPv4-mapped address is checked as the IPv4 address it carries.
    return isPublicAddress({
      version: 4,
      value: address.value & BigInt(0xffffffff),
    });
  }
  const ranges = address.version === 4 ? NON_PUBLIC_IPV4 : NON_PUBLIC_IPV6;
  return !ranges.some((range) => isSubnetOf(hostNetwork(address), range));
};
