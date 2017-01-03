import template from './openstack-allocation-pool.html';

class OpenstackAllocationPoolController {
  rangeStart() {
    return this.field.rangeStart.replace('X', this.model.subnet_cidr);
  }

  rangeEnd() {
    return this.field.rangeEnd.replace('X', this.model.subnet_cidr);
  }
}

const openstackAllocationPool = {
  template: template,
  bindings: {
    field: '<',
    model: '<'
  },
  controller: OpenstackAllocationPoolController
};

export default openstackAllocationPool;
