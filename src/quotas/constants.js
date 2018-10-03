export const QUOTA_NAMES_MAPPING = {
  vcpu: 'cores',
  storage: 'disk',
  ram: 'ram',
};

export const QUOTA_NAMES = {
  floating_ip_count: gettext('Floating IP count'),
  vcpu: gettext('vCPU count'),
  ram: gettext('RAM'),
  storage: gettext('Storage'),
  vm_count: gettext('Virtual machines count'),
  instances: gettext('Instances count'),
  volumes: gettext('Volumes count'),
  snapshots: gettext('Snapshots count'),
  cost: gettext('Monthly cost'),
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
  [QUOTA_PACKAGE_TYPE]: gettext('Package amount'),
  [QUOTA_SPL_TYPE]: gettext('Project service')
};

