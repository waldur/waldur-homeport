import template from './openstack-subnet.html';
import { PRIVATE_CIDR_PATTERN } from '../utils';

const openstackSubnet = {
  template: template,
  bindings: {
    field: '<',
    model: '<',
    form: '<',
  },
  controller: class {
    $onInit() {
      this.pattern = PRIVATE_CIDR_PATTERN;
    }
  },
};

export default openstackSubnet;
