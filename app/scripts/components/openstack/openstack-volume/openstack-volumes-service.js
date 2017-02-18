// @ngInject
export default function openstackVolumesService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/openstacktenant-volumes/';
    }
  });
  return new ServiceClass();
}
