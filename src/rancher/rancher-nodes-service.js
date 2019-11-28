// @ngInject
export default function rancherNodesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/rancher-nodes/';
    }
  });
  return new ServiceClass();
}
