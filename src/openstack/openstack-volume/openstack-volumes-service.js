// @ngInject
export default function openstackVolumesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/openstacktenant-volumes/';
    }
  });
  return new ServiceClass();
}
