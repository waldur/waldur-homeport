import { translate } from '@waldur/i18n';

export const QUOTA_NAMES_MAPPING = {
  vcpu: 'cores',
  storage: 'disk',
  ram: 'ram',
};

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

export const QUOTA_PACKAGE_TYPE = 'QUOTA_PACKAGE_TYPE';

export const QUOTA_SPL_TYPE = 'QUOTA_SPL_TYPE';

export const QUOTA_TYPES = {
  [QUOTA_PACKAGE_TYPE]: translate('Package amount'),
  [QUOTA_SPL_TYPE]: translate('Project service'),
};

