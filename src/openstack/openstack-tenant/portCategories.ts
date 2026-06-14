import { translate } from '@/i18n';

interface PortCategory {
  label: string;
  variant: 'primary' | 'warning' | 'danger';
  warning?: string;
}

interface PortCategoryRule {
  matches(deviceOwner: string): boolean;
  getCategory(): PortCategory;
}

const RULES: PortCategoryRule[] = [
  {
    matches: (owner) => owner === 'network:distributed',
    getCategory: () => ({
      label: translate('Metadata'),
      variant: 'danger',
      warning: translate(
        'This is the distributed virtual router port serving the OpenStack metadata service (169.254.169.254). If you delete it, cloud-init will stop working for instances in this network: new instances will not receive SSH keys or initial configuration. This port can only be restored via the OpenStack CLI.',
      ),
    }),
  },
  {
    matches: (owner) =>
      owner.startsWith('network:router_') ||
      owner.startsWith('network:ha_router_'),
    getCategory: () => ({
      label: translate('Router'),
      variant: 'warning',
      warning: translate(
        'This port belongs to a router. Deleting it may break routing and external connectivity for this network.',
      ),
    }),
  },
  {
    matches: (owner) => owner === 'network:dhcp',
    getCategory: () => ({
      label: translate('DHCP'),
      variant: 'warning',
      warning: translate(
        'This port is used by the DHCP service. Deleting it may prevent instances in this network from obtaining IP addresses.',
      ),
    }),
  },
  {
    matches: (owner) => owner.startsWith('network:floatingip'),
    getCategory: () => ({
      label: translate('Floating IP'),
      variant: 'warning',
      warning: translate(
        'This port is used by the floating IP infrastructure. Deleting it may break floating IP connectivity in this network.',
      ),
    }),
  },
  {
    matches: (owner) =>
      owner.toLowerCase().includes('loadbalancer') ||
      owner.startsWith('octavia:'),
    getCategory: () => ({
      label: translate('Load balancer'),
      variant: 'warning',
      warning: translate(
        'This port belongs to a load balancer. Deleting it may break the load balancer; manage it through the load balancer instead.',
      ),
    }),
  },
  {
    matches: (owner) =>
      owner.startsWith('network:vpn') || owner === 'network:firewall',
    getCategory: () => ({
      label: translate('VPN / Firewall'),
      variant: 'warning',
      warning: translate(
        'This port is used by a VPN or firewall service. Deleting it may break that service.',
      ),
    }),
  },
  {
    matches: (owner) =>
      owner.startsWith('baremetal:') || owner.startsWith('ironic:'),
    getCategory: () => ({
      label: translate('Baremetal'),
      variant: 'primary',
    }),
  },
  {
    matches: (owner) =>
      [
        'network:metering',
        'network:agent_gateway_port',
        'network:routed',
      ].includes(owner),
    getCategory: () => ({
      label: translate('Internal'),
      variant: 'warning',
      warning: translate(
        'This is an internal OpenStack service port. Deleting it may disrupt network services.',
      ),
    }),
  },
  {
    matches: (owner) => owner.startsWith('compute:'),
    getCategory: () => ({
      label: translate('Instance'),
      variant: 'primary',
    }),
  },
];

export const getPortCategory = (
  deviceOwner: string | null | undefined,
): PortCategory | null => {
  if (!deviceOwner) {
    return null;
  }
  const rule = RULES.find((item) => item.matches(deviceOwner));
  return rule ? rule.getCategory() : null;
};
