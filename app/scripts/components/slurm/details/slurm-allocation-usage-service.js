// @ngInject
export default function SlurmAllocationUsageService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/slurm-allocation-usage/';
    },
  });
  return new ServiceClass();
}
