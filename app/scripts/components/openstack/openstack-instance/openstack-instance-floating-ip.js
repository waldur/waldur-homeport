import template from './openstack-instance-floating-ip.html';

export default {
  template: template,
  bindings: {
    field: '=',
    model: '='
  },
  controller: class OpenstackInstanceFloatingIp {
    // @ngInject
    constructor() {
      this.field.choices.unshift({allocate_floating_ip: true, address: 'Auto-assign'});
    }

    selected(selected) {
      if (selected && selected.allocate_floating_ip) {
        this.model.allocate_floating_ip = true;
      } else if (selected && !selected.allocate_floating_ip) {
        this.model.allocate_floating_ip = false;
      } else {
        this.model.allocate_floating_ip = false;
        delete this.model[this.field.name];
      }
    }
  },
};
