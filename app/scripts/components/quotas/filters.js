// @ngInject
export function quotaName($filter) {
  var names = {
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
  return function(name) {
    if (names[name]) {
      return names[name];
    }
    name = name.replace(/_/g, ' ');
    return $filter('titleCase')(name);
  };
}

// @ngInject
export function quotaValue($filter) {
  var filters = {
    ram: 'filesize',
    storage: 'filesize',
    backup_storage: 'filesize',
    cost: 'defaultCurrency',
  };
  return function(value, name) {
    if (value == -1) {
      return '∞';
    }
    var filter = filters[name];
    if (filter) {
      return $filter(filter)(value);
    } else {
      return value;
    }
  };
}
