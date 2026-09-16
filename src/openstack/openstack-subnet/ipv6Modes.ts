import { Ipv6Mode } from 'waldur-js-client';

import { translate } from '@/i18n';

/** What the create-subnet form offers: one choice stands for both the router
 * advertisement mode and the address mode, and 'none' leaves both unset. */
export type Ipv6ModeChoice = Ipv6Mode | 'none';

// In these modes instances build their address from the prefix, which only
// works on a /64; the API rejects any other prefix length with them.
export const PREFIX_BUILT_IPV6_MODES: ReadonlyArray<Ipv6ModeChoice> = [
  'slaac',
  'dhcpv6-stateless',
];

const getIpv6ModeLabel = (mode: Ipv6ModeChoice) =>
  ({
    slaac: translate('SLAAC'),
    'dhcpv6-stateful': translate('DHCPv6 stateful'),
    'dhcpv6-stateless': translate('DHCPv6 stateless'),
    none: translate('None'),
  })[mode] ?? mode;

export const getIpv6ModeOptions = () =>
  (
    ['slaac', 'dhcpv6-stateful', 'dhcpv6-stateless', 'none'] as Ipv6ModeChoice[]
  ).map((value) => ({ value, label: getIpv6ModeLabel(value) }));

/** On an IPv6 subnet a null mode is a choice -- no advertisement, or no
 * address assignment -- so it reads as "None" rather than as missing data. */
export const formatIpv6Mode = (mode?: Ipv6Mode | null) =>
  getIpv6ModeLabel(mode || 'none');
