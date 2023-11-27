import { translate } from '@waldur/i18n';

export const QUOTA_NAMES = {
  floating_ip_count: translate('Floating IP count'),
  vcpu: translate('vCPU count'),
  ram: 'RAM',
  storage: translate('Storage'),
  vm_count: translate('Virtual machines count'),
  instances: translate('Instances count'),
  volumes: translate('Volumes count'),
  snapshots: translate('Snapshots count'),
  cost: translate('Monthly cost'),
};

export const QUOTA_FILTERS = {
  ram: 'filesize',
  storage: 'filesize',
  volumes_size: 'filesize',
  snapshots_size: 'filesize',
  backup_storage: 'filesize',
  cost: 'defaultCurrency',
};

export const QUOTA_CATEGORIES: Record<
  string,
  { label: string; names: (string | RegExp)[] }
> = {
  compute: {
    label: translate('Compute'),
    names: ['instances', 'ram', 'vcpu'],
  },
  network: {
    label: translate('Network'),
    names: [
      'floating_ip_count',
      'network_count',
      'port_count',
      'security_group_count',
      'security_group_rule_count',
      'subnet_count',
    ],
  },
  storage: {
    label: translate('Storage'),
    names: [
      'snapshots',
      'snapshots_size',
      'storage',
      'volumes',
      'volumes_size',
      /^gigabytes/,
    ],
  },
};
