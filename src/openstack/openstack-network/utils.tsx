import { OpenStackSubNetAllocationPool } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

export const formatAllocationPool = (pools) =>
  pools.length === 0
    ? '―'
    : pools.map((pool, index) => (
        <div key={index}>
          {pool.start} ― {pool.end}
        </div>
      ));
interface IPv4Address {
  octets: number[];
  toString(): string;
}

const parseIPv4 = (address: string): IPv4Address | null => {
  const octets = address.split('.').map((octet) => parseInt(octet, 10));
  if (
    octets.length !== 4 ||
    octets.some((octet) => isNaN(octet) || octet < 0 || octet > 255)
  ) {
    return null;
  }
  return {
    octets,
    toString() {
      return this.octets.join('.');
    },
  };
};

const parseCIDR = (
  cidr: string,
): { address: IPv4Address; prefix: number } | null => {
  const parts = cidr.split('/');
  if (parts.length !== 2) {
    return null;
  }

  const address = parseIPv4(parts[0]);
  const prefix = parseInt(parts[1], 10);

  if (!address || isNaN(prefix) || prefix < 0 || prefix > 32) {
    return null;
  }

  return { address, prefix };
};

const ipToLong = (ip: IPv4Address): number => {
  return (
    (ip.octets[0] << 24) |
    (ip.octets[1] << 16) |
    (ip.octets[2] << 8) |
    ip.octets[3]
  );
};

const longToIp = (long: number): IPv4Address => {
  return {
    octets: [
      (long >>> 24) & 255,
      (long >>> 16) & 255,
      (long >>> 8) & 255,
      long & 255,
    ],

    toString() {
      return this.octets.join('.');
    },
  };
};

export const getIPsInRange = (startIp, endIp) => {
  if (!startIp || !endIp) {
    return [];
  }
  const start = ipToLong(parseIPv4(startIp));
  const end = ipToLong(parseIPv4(endIp));
  const result = [];

  for (let i = start; i <= end; i++) {
    result.push(longToIp(i).toString());
  }

  return result;
};

const getNetworkAddress = (ip: IPv4Address, prefix: number): IPv4Address => {
  const mask = ~((1 << (32 - prefix)) - 1);
  return longToIp(ipToLong(ip) & mask);
};

const getBroadcastAddress = (ip: IPv4Address, prefix: number): IPv4Address => {
  const mask = (1 << (32 - prefix)) - 1;
  return longToIp(ipToLong(ip) | mask);
};

export const getDefaultAllocationPool = (cidr: string) => {
  if (!cidr) return { start: '', end: '' };

  const parsed = parseCIDR(cidr);
  if (!parsed) return { start: '', end: '' };

  const { address, prefix } = parsed;

  const networkAddress = getNetworkAddress(address, prefix);
  const broadcastAddress = getBroadcastAddress(address, prefix);

  const firstUsable = longToIp(ipToLong(networkAddress) + 2);
  const lastUsable = longToIp(ipToLong(broadcastAddress) - 1);

  return {
    start: firstUsable.toString(),
    end: lastUsable.toString(),
  };
};

export const isIPInRange = (ip: string, cidr: string): boolean => {
  const ipObject = parseIPv4(ip);
  const cidrObject = parseCIDR(cidr);

  if (!ipObject || !cidrObject) {
    return false;
  }

  const { address, prefix } = cidrObject;
  const networkAddr = getNetworkAddress(address, prefix);
  const broadcastAddr = getBroadcastAddress(address, prefix);

  const ipLong = ipToLong(ipObject);
  const networkLong = ipToLong(networkAddr);
  const broadcastLong = ipToLong(broadcastAddr);

  return ipLong >= networkLong && ipLong <= broadcastLong;
};

interface ValidationError {
  error: string;
  field?: string;
}

export const validateAllocationPool = (
  pool: OpenStackSubNetAllocationPool,
  cidr: string,
): ValidationError | null => {
  const startIp = parseIPv4(pool.start);
  if (!startIp) {
    return {
      error: translate('Start IP is not a valid IPv4 address'),
      field: 'start',
    };
  }

  const endIp = parseIPv4(pool.end);
  if (!endIp) {
    return {
      error: translate('End IP is not a valid IPv4 address'),
      field: 'end',
    };
  }

  const startLong = ipToLong(startIp);
  const endLong = ipToLong(endIp);
  if (startLong > endLong) {
    return {
      error: translate('End IP must be greater than or equal to Start IP'),
      field: 'end',
    };
  }

  if (!isIPInRange(pool.start, cidr)) {
    return {
      error: translate('Start IP is not within the CIDR range'),
      field: 'start',
    };
  }

  if (!isIPInRange(pool.end, cidr)) {
    return {
      error: translate('End IP is not within the CIDR range'),
      field: 'end',
    };
  }

  return null;
};
