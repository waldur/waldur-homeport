// @ngInject
export function quotaName($filter) {
  var names = {
    floating_ip_count: 'Floating IP count',
    vcpu: 'vCPU count',
    ram: 'RAM',
    vm_count: 'Virtual machines count',
    instances: 'Instances count',
    volumes: 'Volumes count',
    snapshots: 'Snapshots count'
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
    backup_storage: 'filesize'
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
