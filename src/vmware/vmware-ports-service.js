// @ngInject
export default function vmwarePortsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/vmware-ports/';
    }
  });
  return new ServiceClass();
}
