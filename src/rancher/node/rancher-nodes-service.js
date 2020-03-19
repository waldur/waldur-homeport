// @ngInject
export default function rancherNodesService(baseServiceClass) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/rancher-nodes/';
    },
  });
  return new ServiceClass();
}
