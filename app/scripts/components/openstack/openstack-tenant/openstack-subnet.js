import template from './openstack-subnet.html';

const openstackSubnet = {
  template: template,
  bindings: {
    field: '<',
    model: '<'
  },
  controller: class {
    $onInit() {
      [this.prefix, this.suffix] = this.field.mask.split('X');
    }
  }
};

export default openstackSubnet;
