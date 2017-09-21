// @ngInject
export default function SlurmPackagesService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/slurm-packages/';
    }
  });
  return new ServiceClass();
}
