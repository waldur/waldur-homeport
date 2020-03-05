import template from './openstack-allocation-pool.html';

const openstackAllocationPool = {
  template: template,
  bindings: {
    field: '<',
    model: '<',
  },
  controller: class {
    get allocationPool() {
      const subnetCidr = this.model[this.field.parentField];
      const prefix = subnetCidr
        .split('.')
        .slice(0, 3)
        .join('.');
      return `${prefix}.10 - ${prefix}.200`;
    }
  },
};

export default openstackAllocationPool;
