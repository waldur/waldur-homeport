import { PRIVATE_CIDR_PATTERN } from '../utils';

import template from './openstack-subnet.html';

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
