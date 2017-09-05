// @ngInject
export default function SlurmAllocationService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/slurm-allocation/';
    },
  });
  return new ServiceClass();
}
