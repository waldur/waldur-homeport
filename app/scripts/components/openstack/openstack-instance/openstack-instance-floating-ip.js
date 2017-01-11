import template from './openstack-instance-floating-ip.html';

export default function openstackInstanceFloatingIp() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      field: '=',
      model: '='
    },
    controller: function() {
      this.selected = 'floating_ip';
    },
    controllerAs: '$ctrl',
    bindToController: true
  };
}
