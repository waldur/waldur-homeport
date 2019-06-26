// @ngInject
export default function vmwareDisksService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/vmware-disks/';
    }
  });
  return new ServiceClass();
}
