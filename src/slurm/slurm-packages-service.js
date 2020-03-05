// @ngInject
export default function SlurmPackagesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/slurm-packages/';
    },
    loadPackage: function(service_settings) {
      return this.getList({ service_settings }).then(packages => {
        if (packages.length !== 1) {
          return;
        }
        const result = packages[0];
        return {
          ...result,
          cpu_price: parseFloat(result.cpu_price),
          gpu_price: parseFloat(result.gpu_price),
          ram_price: parseFloat(result.ram_price),
        };
      });
    },
  });
  return new ServiceClass();
}
