export const SUBNET_OPTIONS = {
  subnet_cidr: {
    component: 'openstackSubnet',
    label: 'Internal network mask (CIDR)',
    default_value: 42,
    mask: '192.168.X.0/24',
    serializer: (value, field) => field.mask.replace('X', value)
  },
  subnet_allocation_pool: {
    component: 'openstackAllocationPool',
    label: 'Internal network allocation pool',
    range: '192.168.X.10 — 192.168.X.200',
  },
};
